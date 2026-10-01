const { Op } = require("sequelize");
const { Brand } = require("../models");
const { IsEmpty } = require("../helper/validate");

// 1. GET ALL BRANDS
const getBrand = async (req, res) => {
  try {
    const { search, active } = req.query;
    let whereClause = {};

    // Optional filter by brand name
    if (search) {
      whereClause.brand_name = { [Op.like]: `%${search}%` };
    }

    // Optional filter by active status
    if (active !== undefined && active !== "") {
      whereClause.active = active === "true" || active === "1" || active === 1 ? 1 : 0;
    }

    const brands = await Brand.findAll({
      where: whereClause,
      order: [["brand_id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      total: brands.length,
      list: brands,
    });
  } catch (error) {
    console.error("Error in getBrand:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 2. CREATE BRAND
const createBrand = async (req, res) => {
  try {
    const { brand_name, description, active } = req.body;

    // Validate required fields
    if (IsEmpty(brand_name) || !brand_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "brand_name is required",
      });
    }

    // Check if brand name already exists (unique check)
    const existingBrand = await Brand.findOne({
      where: { brand_name: brand_name.trim() },
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: `Brand '${brand_name.trim()}' already exists`,
      });
    }

    // Create new brand
    const newBrand = await Brand.create({
      brand_name: brand_name.trim(),
      description: description || null,
      active: active !== undefined ? (active ? 1 : 0) : 1,
    });

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: newBrand,
    });
  } catch (error) {
    console.error("Error in createBrand:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: error.message,
    });
  }
};

// 3. UPDATE BRAND
const updateBrand = async (req, res) => {
  try {
    const id = req.params.id || req.body.brand_id;
    const { brand_name, description, active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is required in URL parameter or body",
      });
    }

    // Find brand by Primary Key
    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: `Brand with ID ${id} not found`,
      });
    }

    // If updating name, check for uniqueness against other records
    if (brand_name && brand_name.trim() !== brand.brand_name) {
      const duplicate = await Brand.findOne({
        where: {
          brand_name: brand_name.trim(),
          brand_id: { [Op.ne]: id },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Brand name '${brand_name.trim()}' is already in use`,
        });
      }
    }

    // Update fields
    await brand.update({
      brand_name: brand_name !== undefined ? brand_name.trim() : brand.brand_name,
      description: description !== undefined ? description : brand.description,
      active: active !== undefined ? (active ? 1 : 0) : brand.active,
    });

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Error in updateBrand:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error: error.message,
    });
  }
};

// 4. DELETE BRAND
const deleteBrand = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is required in URL parameter",
      });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: `Brand with ID ${id} not found`,
      });
    }

    await brand.destroy();

    res.status(200).json({
      success: true,
      message: `Brand with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Error in deleteBrand:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error: error.message,
    });
  }
};

module.exports = {
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};
