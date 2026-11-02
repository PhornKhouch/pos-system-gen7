const { ProductMaster, ProductImage, sequelize } = require("../models");
const { removeFile } = require("../helper/upload");
const logError = require("../helper/log_error");

// Images are stored in src/assets/product_images, image_url keeps the relative path
// so it can be served from /assets/<image_url> and removed with removeFile()
const PRODUCT_IMAGE_FOLDER = "product_images";

const removeUploadedFiles = (files = []) => {
  files.forEach((file) => removeFile(`${PRODUCT_IMAGE_FOLDER}/${file.filename}`));
};

// 1. GET ALL IMAGES BY PRODUCT ID
const getImagesByProductId = async (req, res) => {
  try {
    const product_id = req.params.product_id;

    const product = await ProductMaster.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${product_id} not found`,
      });
    }

    const images = await ProductImage.findAll({
      where: { product_id },
      order: [
        ["is_primary", "DESC"],
        ["display_order", "ASC"],
        ["image_id", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      total: images.length,
      list: images,
    });
  } catch (error) {
    logError(res, error, "productImage.getImagesByProductId");
  }
};

// 2. UPLOAD MULTIPLE IMAGES BY PRODUCT ID
const uploadProductImages = async (req, res) => {
  const files = req.files || [];
  const t = await sequelize.transaction();
  try {
    const product_id = req.params.product_id;

    if (files.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Please select at least one image (field name: images)",
      });
    }

    const product = await ProductMaster.findByPk(product_id);
    if (!product) {
      await t.rollback();
      removeUploadedFiles(files);
      return res.status(404).json({
        success: false,
        message: `Product with ID ${product_id} not found`,
      });
    }

    // Continue display_order after existing images
    const existingCount = await ProductImage.count({ where: { product_id } });
    const maxOrder = (await ProductImage.max("display_order", { where: { product_id } })) || 0;

    // Optional alt text (same for all files in this batch)
    const image_alt = req.body.image_alt && req.body.image_alt.trim() ? req.body.image_alt.trim() : null;

    const rows = files.map((file, index) => ({
      product_id: Number(product_id),
      image_name: file.originalname,
      image_url: `${PRODUCT_IMAGE_FOLDER}/${file.filename}`,
      image_alt,
      // First image becomes primary when the product has no images yet
      is_primary: existingCount === 0 && index === 0,
      display_order: maxOrder + index + 1,
    }));

    const images = await ProductImage.bulkCreate(rows, { transaction: t });
    await t.commit();

    res.status(201).json({
      success: true,
      message: `${images.length} image(s) uploaded successfully`,
      total: images.length,
      list: images,
    });
  } catch (error) {
    await t.rollback();
    removeUploadedFiles(files);
    logError(res, error, "productImage.uploadProductImages");
  }
};

// 3. SET PRIMARY IMAGE
const setPrimaryImage = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;

    const image = await ProductImage.findByPk(id);
    if (!image) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Image with ID ${id} not found`,
      });
    }

    await ProductImage.update(
      { is_primary: false },
      { where: { product_id: image.product_id }, transaction: t }
    );
    await image.update({ is_primary: true }, { transaction: t });
    await t.commit();

    res.status(200).json({
      success: true,
      message: "Primary image updated successfully",
      data: image,
    });
  } catch (error) {
    await t.rollback();
    logError(res, error, "productImage.setPrimaryImage");
  }
};

// 4. DELETE IMAGE
const deleteProductImage = async (req, res) => {
  try {
    const id = req.params.id;

    const image = await ProductImage.findByPk(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: `Image with ID ${id} not found`,
      });
    }

    const { product_id, is_primary, image_url } = image;
    await image.destroy();
    removeFile(image_url);

    // Promote the next image to primary if the primary one was deleted
    if (is_primary) {
      const next = await ProductImage.findOne({
        where: { product_id },
        order: [["display_order", "ASC"], ["image_id", "ASC"]],
      });
      if (next) await next.update({ is_primary: true });
    }

    res.status(200).json({
      success: true,
      message: `Image with ID ${id} deleted successfully`,
    });
  } catch (error) {
    logError(res, error, "productImage.deleteProductImage");
  }
};

module.exports = {
  getImagesByProductId,
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage,
};
