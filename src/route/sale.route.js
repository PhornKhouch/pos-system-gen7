const { getReceiptPdf } = require("../controller/sale.controller");
const { validate_token } = require("../middleware/auth");

function SaleRoute(app) {
  app.get("/api/v1/sale/receipt/:id/pdf", validate_token(), getReceiptPdf); // Download invoice PDF (auto after payment + reprint)
}

module.exports = SaleRoute;
