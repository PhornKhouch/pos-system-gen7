const PDFDocument = require("pdfkit");
const moment = require("moment");
const { Sale, SaleItem, SalePayment, SaleReceipt, ProductMaster, User } = require("../models");
const logError = require("../helper/log_error");

const RECEIPT_WIDTH = 226; // 80mm thermal paper in PDF points
const MARGIN = 12;
const money = (value) => `$${Number(value).toFixed(2)}`;

// Turns "KHQR-USD:<hash>" into a readable payment label + reference
const describePayment = (payment) => {
  const match = /^KHQR-(USD|KHR):(.+)$/.exec(String(payment?.reference_number || ""));
  if (match) {
    return { method: `KHQR (${match[1]})`, reference: match[2] };
  }
  return { method: String(payment?.payment_method || "-").toUpperCase(), reference: payment?.reference_number || null };
};

// GET /api/v1/sale/receipt/:id/pdf — invoice PDF for a completed sale (also used for reprint)
const getReceiptPdf = async (req, res) => {
  try {
    const saleId = Number(req.params.id);
    if (!Number.isInteger(saleId)) {
      return res.status(400).json({ success: false, message: "Sale ID is required" });
    }

    const sale = await Sale.findByPk(saleId, {
      include: [
        { model: SaleItem, as: "items", include: [{ model: ProductMaster, as: "product", attributes: ["product_name", "sku"] }] },
        { model: SalePayment, as: "payments" },
        { model: SaleReceipt, as: "receipt" },
        { model: User, as: "user", attributes: ["username", "full_name"] },
      ],
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }
    if (sale.status !== "completed" || !sale.receipt) {
      return res.status(400).json({ success: false, message: "Receipt is only available for completed sales" });
    }

    const payment = (sale.payments || []).find((p) => p.status === "completed") || sale.payments?.[0];
    const { method, reference } = describePayment(payment);
    const subtotal = sale.items.reduce((sum, item) => sum + Number(item.total_price), 0);

    // Height grows with the number of items (2 lines each)
    const height = 330 + sale.items.length * 26 + (reference ? 24 : 0);
    const doc = new PDFDocument({ size: [RECEIPT_WIDTH, height], margin: MARGIN });
    const contentWidth = RECEIPT_WIDTH - MARGIN * 2;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${sale.receipt.receipt_number}.pdf"`);
    doc.pipe(res);

    const divider = () => {
      doc.moveDown(0.4);
      doc.fontSize(8).fillColor("#999").text("-".repeat(60), { width: contentWidth, align: "center", lineBreak: false });
      doc.fillColor("#000").moveDown(0.6);
    };
    // label on the left, value on the right, same line
    const row = (label, value, { bold = false, size = 8 } = {}) => {
      const y = doc.y;
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
      doc.text(label, MARGIN, y, { width: contentWidth * 0.6 });
      doc.text(value, MARGIN, y, { width: contentWidth, align: "right" });
      doc.moveDown(0.2);
    };

    // Header
    doc.font("Helvetica-Bold").fontSize(13).text(process.env.STORE_LABEL || "POS Store", { align: "center" });
    doc.font("Helvetica").fontSize(8)
      .text(process.env.MERCHANT_CITY || "Phnom Penh", { align: "center" });
    if (process.env.MERCHANT_PHONE) doc.text(`Tel: ${process.env.MERCHANT_PHONE}`, { align: "center" });
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(10).text("INVOICE", { align: "center" });
    divider();

    row("Invoice No", sale.receipt.receipt_number);
    row("Sale No", sale.sale_no);
    row("Date", moment(sale.receipt.receipt_date).format("DD-MM-YYYY hh:mm A"));
    row("Cashier", sale.user?.full_name || sale.user?.username || "-");
    divider();

    // Items
    for (const item of sale.items) {
      doc.font("Helvetica-Bold").fontSize(8).text(item.product?.product_name || `Product #${item.product_id}`, MARGIN, doc.y, { width: contentWidth });
      row(`  ${item.quantity} x ${money(item.unit_price)}`, money(item.total_price));
    }
    divider();

    // Totals
    row("Subtotal", money(subtotal));
    if (Number(sale.discount) > 0) row("Discount", `-${money(sale.discount)}`);
    if (Number(sale.tax_amount) > 0) row("Tax", money(sale.tax_amount));
    doc.moveDown(0.2);
    row("TOTAL", money(sale.total_amount), { bold: true, size: 11 });
    divider();

    row("Payment", method);
    row("Status", "PAID", { bold: true });
    if (reference) {
      doc.font("Helvetica").fontSize(6).fillColor("#555")
        .text(`Ref: ${reference}`, MARGIN, doc.y, { width: contentWidth });
      doc.fillColor("#000");
    }
    divider();

    doc.font("Helvetica").fontSize(9).text("Thank you! Please come again.", MARGIN, doc.y, { width: contentWidth, align: "center" });
    doc.end();
  } catch (error) {
    // Headers may already be sent once the PDF started streaming
    if (res.headersSent) {
      console.error("Receipt PDF error:", error);
      return res.end();
    }
    logError(res, error, "sale.getReceiptPdf");
  }
};

module.exports = { getReceiptPdf };
