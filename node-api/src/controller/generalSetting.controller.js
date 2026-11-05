const { Op, UniqueConstraintError } = require("sequelize");
const { GeneralSetting } = require("../models");
const { IsEmpty } = require("../helper/validate");
const logError = require("../helper/log_error");

// tbl_general_setting: key/value settings, either global (store_id = NULL) or per store.
// Unique per scope: uq_setting_scope_key (store_scope = IFNULL(store_id, 0), setting_key)

const SETTING_TYPES = ["text", "number", "boolean", "email", "url", "color", "json"];
const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.-]{1,99}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const MAX_VALUE_LENGTH = 500;

// "", null, "null", "global" → NULL (global setting); otherwise a positive integer
const parseStoreId = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "" || value === "null" || value === "global") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : NaN;
};

// Validates the value against its type and returns the string that is stored.
// Returns { value } or { error }.
const normalizeValue = (rawValue, type) => {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return { value: null };
  }

  let value;
  switch (type) {
    case "number": {
      const num = Number(rawValue);
      if (!Number.isFinite(num)) return { error: "Value must be a valid number" };
      value = String(num);
      break;
    }
    case "boolean": {
      const text = String(rawValue).toLowerCase();
      if (["true", "1", "yes", "on"].includes(text)) value = "true";
      else if (["false", "0", "no", "off"].includes(text)) value = "false";
      else return { error: "Value must be true or false" };
      break;
    }
    case "email":
      value = String(rawValue).trim();
      if (!EMAIL_PATTERN.test(value)) return { error: "Value must be a valid email address" };
      break;
    case "url":
      value = String(rawValue).trim();
      try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return { error: "Value must be a valid URL starting with http:// or https://" };
      }
      break;
    case "color":
      value = String(rawValue).trim();
      if (!COLOR_PATTERN.test(value)) return { error: "Value must be a hex color, e.g. #1677ff" };
      break;
    case "json":
      try {
        value = JSON.stringify(typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue);
      } catch {
        return { error: "Value must be valid JSON" };
      }
      break;
    default: // text
      value = String(rawValue);
  }

  if (value.length > MAX_VALUE_LENGTH) {
    return { error: `Value must be at most ${MAX_VALUE_LENGTH} characters` };
  }
  return { value };
};

// Typed value for API consumers (setting_value stays the raw stored string)
const parseValue = (setting) => {
  const raw = setting.setting_value;
  if (raw === null || raw === undefined) return null;
  switch (setting.setting_type) {
    case "number":
      return Number(raw);
    case "boolean":
      return raw === "true";
    case "json":
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    default:
      return raw;
  }
};

const toResponse = (setting) => ({ ...setting.toJSON(), parsed_value: parseValue(setting) });

const findDuplicate = (setting_key, store_id, excludeId) =>
  GeneralSetting.findOne({
    where: {
      setting_key,
      store_id: store_id === null ? { [Op.is]: null } : store_id,
      ...(excludeId ? { setting_id: { [Op.ne]: excludeId } } : {}),
    },
  });

const scopeLabel = (store_id) => (store_id === null ? "global" : `store #${store_id}`);

const duplicateMessage = (setting_key, store_id) =>
  `Setting '${setting_key}' already exists for ${scopeLabel(store_id)}`;

// 1. GET ALL SETTINGS
// query: search?, setting_type?, store_id? ("global" = only global, number = that store)
const getSettings = async (req, res) => {
  try {
    const { search, setting_type } = req.query;
    const whereClause = {};

    if (search && search.trim()) {
      whereClause[Op.or] = [
        { setting_key: { [Op.like]: `%${search.trim()}%` } },
        { setting_value: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (setting_type && SETTING_TYPES.includes(setting_type)) {
      whereClause.setting_type = setting_type;
    }

    if (req.query.store_id !== undefined && req.query.store_id !== "" && req.query.store_id !== "all") {
      const storeId = parseStoreId(req.query.store_id);
      if (Number.isNaN(storeId)) {
        return res.status(400).json({ success: false, message: "store_id must be a positive number or 'global'" });
      }
      whereClause.store_id = storeId === null ? { [Op.is]: null } : storeId;
    }

    const settings = await GeneralSetting.findAll({
      where: whereClause,
      order: [["setting_key", "ASC"], ["store_id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      total: settings.length,
      types: SETTING_TYPES,
      list: settings.map(toResponse),
    });
  } catch (error) {
    logError(res, error, "generalSetting.getSettings");
  }
};

// 2. GET ONE SETTING BY ID
const getSettingById = async (req, res) => {
  try {
    const setting = await GeneralSetting.findByPk(req.params.id);
    if (!setting) {
      return res.status(404).json({ success: false, message: `Setting with ID ${req.params.id} not found` });
    }
    res.status(200).json({ success: true, data: toResponse(setting) });
  } catch (error) {
    logError(res, error, "generalSetting.getSettingById");
  }
};

// 3. GET SETTING BY KEY — store value first, falls back to the global value
// GET /api/v1/setting/key/:key?store_id=1
const getSettingByKey = async (req, res) => {
  try {
    const setting_key = req.params.key;
    const storeId = parseStoreId(req.query.store_id);
    if (Number.isNaN(storeId)) {
      return res.status(400).json({ success: false, message: "store_id must be a positive number" });
    }

    let setting = null;
    if (storeId) {
      setting = await GeneralSetting.findOne({ where: { setting_key, store_id: storeId } });
    }
    if (!setting) {
      setting = await GeneralSetting.findOne({ where: { setting_key, store_id: { [Op.is]: null } } });
    }
    if (!setting) {
      return res.status(404).json({ success: false, message: `Setting '${setting_key}' not found` });
    }
    res.status(200).json({ success: true, data: toResponse(setting) });
  } catch (error) {
    logError(res, error, "generalSetting.getSettingByKey");
  }
};

// 4. CREATE SETTING
// body: { setting_key, setting_value?, setting_type, store_id? }
const createSetting = async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;
    const setting_type = String(req.body.setting_type || "text").toLowerCase();
    const store_id = parseStoreId(req.body.store_id) ?? null;

    if (IsEmpty(setting_key) || !KEY_PATTERN.test(String(setting_key).trim())) {
      return res.status(400).json({
        success: false,
        message: "setting_key is required: 2-100 characters, start with a letter, only letters, numbers, _ . -",
      });
    }
    if (!SETTING_TYPES.includes(setting_type)) {
      return res.status(400).json({ success: false, message: `setting_type must be one of: ${SETTING_TYPES.join(", ")}` });
    }
    if (Number.isNaN(store_id)) {
      return res.status(400).json({ success: false, message: "store_id must be a positive number or empty for global" });
    }

    const normalized = normalizeValue(setting_value, setting_type);
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error });
    }

    const key = String(setting_key).trim();
    if (await findDuplicate(key, store_id)) {
      return res.status(400).json({ success: false, message: duplicateMessage(key, store_id) });
    }

    const created = await GeneralSetting.create({
      setting_key: key,
      setting_value: normalized.value,
      setting_type,
      store_id,
    });
    await created.reload(); // pick up generated store_scope + DB defaults

    res.status(201).json({ success: true, message: "Setting created successfully", data: toResponse(created) });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({ success: false, message: "This setting key already exists for that scope" });
    }
    logError(res, error, "generalSetting.createSetting");
  }
};

// 5. UPDATE SETTING
// body: any of { setting_key, setting_value, setting_type, store_id }
const updateSetting = async (req, res) => {
  try {
    const id = req.params.id;
    const setting = await GeneralSetting.findByPk(id);
    if (!setting) {
      return res.status(404).json({ success: false, message: `Setting with ID ${id} not found` });
    }

    const key = req.body.setting_key !== undefined ? String(req.body.setting_key).trim() : setting.setting_key;
    const type = req.body.setting_type !== undefined ? String(req.body.setting_type).toLowerCase() : setting.setting_type;
    const parsedStore = parseStoreId(req.body.store_id);
    const store_id = parsedStore === undefined ? setting.store_id : parsedStore;

    if (!KEY_PATTERN.test(key)) {
      return res.status(400).json({
        success: false,
        message: "setting_key: 2-100 characters, start with a letter, only letters, numbers, _ . -",
      });
    }
    if (!SETTING_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `setting_type must be one of: ${SETTING_TYPES.join(", ")}` });
    }
    if (Number.isNaN(store_id)) {
      return res.status(400).json({ success: false, message: "store_id must be a positive number or empty for global" });
    }

    // Re-validate the value whenever value or type changes
    const rawValue = req.body.setting_value !== undefined ? req.body.setting_value : setting.setting_value;
    const normalized = normalizeValue(rawValue, type);
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error });
    }

    if (await findDuplicate(key, store_id, setting.setting_id)) {
      return res.status(400).json({ success: false, message: duplicateMessage(key, store_id) });
    }

    await setting.update({
      setting_key: key,
      setting_type: type,
      setting_value: normalized.value,
      store_id,
    });
    await setting.reload();

    res.status(200).json({ success: true, message: "Setting updated successfully", data: toResponse(setting) });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({ success: false, message: "This setting key already exists for that scope" });
    }
    logError(res, error, "generalSetting.updateSetting");
  }
};

// 6. DELETE SETTING
const deleteSetting = async (req, res) => {
  try {
    const id = req.params.id;
    const setting = await GeneralSetting.findByPk(id);
    if (!setting) {
      return res.status(404).json({ success: false, message: `Setting with ID ${id} not found` });
    }

    await setting.destroy();
    res.status(200).json({ success: true, message: `Setting '${setting.setting_key}' deleted successfully` });
  } catch (error) {
    logError(res, error, "generalSetting.deleteSetting");
  }
};

module.exports = {
  getSettings,
  getSettingById,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
};
