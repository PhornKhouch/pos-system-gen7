const {
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controller/brand.controller");

function BrandRoute(app) {
  app.get("/api/v1/brand/getall", getBrand);
  app.post("/api/v1/brand/create", createBrand);
  app.put("/api/v1/brand/update/:id", updateBrand);
  app.delete("/api/v1/brand/delete/:id", deleteBrand);
}

module.exports = BrandRoute;
