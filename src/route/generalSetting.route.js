const {
  getSettings,
  getSettingById,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
} = require("../controller/generalSetting.controller");
const { validate_token } = require("../middleware/auth");

// Admin: General settings (tbl_general_setting) — requires staff/admin token
function GeneralSettingRoute(app) {
  app.get("/api/v1/setting/getall", validate_token(), getSettings);           // ?search=&setting_type=&store_id=(global|<id>)
  app.get("/api/v1/setting/getone/:id", validate_token(), getSettingById);
  app.get("/api/v1/setting/key/:key", validate_token(), getSettingByKey);     // ?store_id= → store value, else global
  app.post("/api/v1/setting/create", validate_token(), createSetting);
  app.put("/api/v1/setting/update/:id", validate_token(), updateSetting);
  app.delete("/api/v1/setting/delete/:id", validate_token(), deleteSetting);
}

module.exports = GeneralSettingRoute;
