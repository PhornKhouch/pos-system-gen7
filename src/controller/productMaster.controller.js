const { Op } = require("sequelize");
const { ProductMaster, Category, Brand, Attribute } = require("../models");
const { IsEmpty } = require("../helper/validate");

// 1. GET ALL PRODUCT MASTERS
const getProductMaster = async (req, res) => {
  try {
    const { search, category_id, brand_id, attribute_id, active } = req.query;
    let whereClause = {};

    // Search by product_name, sku, or barcode
    if (search) {
      whereClause[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category_id) {
      whereClause.category_id = category_id;
    }

    if (brand_id) {
      whereClause.brand_id = brand_id;
    }

    if (attribute_id) {
      whereClause.attribute_id = attribute_id;
    }

    if (active !== undefined && active !== "") {
      whereClause.active = active === "true" || active === "1" || active === 1 ? 1 : 0;
    }

    const products = await ProductMaster.findAll({
      where: whereClause,
      include: [
        { model: Category, as: "category", attributes: ["category_id", "category_name"] },
        { model: Brand, as: "brand", attributes: ["brand_id", "brand_name"] },
        { model: Attribute, as: "attribute", attributes: ["attribute_id", "attribute_name", "attribute_value"] },
      ],
      order: [["product_id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      total: products.length,
      list: products,
    });
  } catch (error) {
    console.error("Error in getProductMaster:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 2. GET SINGLE PRODUCT MASTER BY ID
const getProductMasterById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required in URL parameter",
      });
    }

    const product = await ProductMaster.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: Attribute, as: "attribute" },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductMasterById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// 3. CREATE PRODUCT MASTER
const createProductMaster = async (req, res) => {
  try {
    const {
      product_name,
      category_id,
      brand_id,
      attribute_id,
      sku,
      barcode,
      description,
      price,
      cost,
      quantity_stock,
      active,
    } = req.body;

    // Validate required fields
    if (IsEmpty(product_name) || !product_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "product_name is required",
      });
    }

    if (IsEmpty(category_id)) {
      return res.status(400).json({
        success: false,
        message: "category_id is required",
      });
    }

    if (IsEmpty(brand_id)) {
      return res.status(400).json({
        success: false,
        message: "brand_id is required",
      });
    }

    if (IsEmpty(sku) || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: "sku is required",
      });
    }

    if (price === undefined || price === null || isNaN(price)) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
      });
    }

    // Check unique SKU
    const existingSku = await ProductMaster.findOne({
      where: { sku: sku.trim() },
    });

    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: `SKU '${sku.trim()}' is already in use`,
      });
    }

    // Check unique Barcode if provided
    if (barcode && barcode.trim()) {
      const existingBarcode = await ProductMaster.findOne({
        where: { barcode: barcode.trim() },
      });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: `Barcode '${barcode.trim()}' is already in use`,
        });
      }
    }

    // Verify foreign key existence
    const categoryExists = await Category.findByPk(category_id);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: `Category with ID ${category_id} does not exist`,
      });
    }

    const brandExists = await Brand.findByPk(brand_id);
    if (!brandExists) {
      return res.status(400).json({
        success: false,
        message: `Brand with ID ${brand_id} does not exist`,
      });
    }

    if (attribute_id) {
      const attributeExists = await Attribute.findByPk(attribute_id);
      if (!attributeExists) {
        return res.status(400).json({
          success: false,
          message: `Attribute with ID ${attribute_id} does not exist`,
        });
      }
    }

    const newProduct = await ProductMaster.create({
      product_name: product_name.trim(),
      category_id,
      brand_id,
      attribute_id: attribute_id || null,
      sku: sku.trim(),
      barcode: barcode ? barcode.trim() : null,
      description: description || null,
      price: parseFloat(price),
      cost: cost !== undefined && !isNaN(cost) ? parseFloat(cost) : 0.0,
      quantity_stock: quantity_stock !== undefined && !isNaN(quantity_stock) ? parseInt(quantity_stock) : 0,
      active: active !== undefined ? (active ? 1 : 0) : 1,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error in createProductMaster:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// 4. UPDATE PRODUCT MASTER
const updateProductMaster = async (req, res) => {
  try {
    const id = req.params.id || req.body.product_id;
    const {
      product_name,
      category_id,
      brand_id,
      attribute_id,
      sku,
      barcode,
      description,
      price,
      cost,
      quantity_stock,
      active,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required in URL parameter or body",
      });
    }

    const product = await ProductMaster.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    // Check SKU duplicate if modified
    if (sku && sku.trim() !== product.sku) {
      const duplicateSku = await ProductMaster.findOne({
        where: {
          sku: sku.trim(),
          product_id: { [Op.ne]: id },
        },
      });

      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          message: `SKU '${sku.trim()}' is already in use`,
        });
      }
    }

    // Check Barcode duplicate if modified
    if (barcode && barcode.trim() !== product.barcode) {
      const duplicateBarcode = await ProductMaster.findOne({
        where: {
          barcode: barcode.trim(),
          product_id: { [Op.ne]: id },
        },
      });

      if (duplicateBarcode) {
        return res.status(400).json({
          success: false,
          message: `Barcode '${barcode.trim()}' is already in use`,
        });
      }
    }

    // Update product
    await product.update({
      product_name: product_name !== undefined ? product_name.trim() : product.product_name,
      category_id: category_id !== undefined ? category_id : product.category_id,
      brand_id: brand_id !== undefined ? brand_id : product.brand_id,
      attribute_id: attribute_id !== undefined ? (attribute_id || null) : product.attribute_id,
      sku: sku !== undefined ? sku.trim() : product.sku,
      barcode: barcode !== undefined ? (barcode ? barcode.trim() : null) : product.barcode,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      cost: cost !== undefined ? parseFloat(cost) : product.cost,
      quantity_stock: quantity_stock !== undefined ? parseInt(quantity_stock) : product.quantity_stock,
      active: active !== undefined ? (active ? 1 : 0) : product.active,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error in updateProductMaster:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// 5. DELETE PRODUCT MASTER
const deleteProductMaster = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required in URL parameter",
      });
    }

    const product = await ProductMaster.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: `Product with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Error in deleteProductMaster:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProductMaster,
  getProductMasterById,
  createProductMaster,
  updateProductMaster,
  deleteProductMaster,
};
