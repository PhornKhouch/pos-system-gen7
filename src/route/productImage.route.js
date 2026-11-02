const {
  getImagesByProductId,
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage,
} = require("../controller/productImage.controller");
const { uploadProductImages: uploadImages } = require("../helper/upload");

const MAX_IMAGES_PER_UPLOAD = 10;

// Wrap multer so invalid file type / size errors return 400 JSON instead of 500
const handleUpload = (req, res, next) => {
  uploadImages.array("images", MAX_IMAGES_PER_UPLOAD)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message:
          err.code === "LIMIT_UNEXPECTED_FILE"
            ? `You can upload up to ${MAX_IMAGES_PER_UPLOAD} images at once (field name: images)`
            : err.message,
      });
    }
    next();
  });
};

function ProductImageRoute(app) {
  app.get("/api/v1/productimage/getbyproduct/:product_id", getImagesByProductId);
  app.post("/api/v1/productimage/upload/:product_id", handleUpload, uploadProductImages);
  app.put("/api/v1/productimage/setprimary/:id", setPrimaryImage);
  app.delete("/api/v1/productimage/delete/:id", deleteProductImage);
}

module.exports = ProductImageRoute;
