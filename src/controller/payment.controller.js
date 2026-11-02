const stripe = require('stripe');
require('dotenv').config();
const axios = require('axios');
const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");
const { sequelize, ProductMaster, Sale, SaleItem, SalePayment, SaleReceipt } = require("../models");
const logError = require("../helper/log_error");
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
const appUrl = 'http://localhost:3000';

const createCheckoutSession = async (request, response) => {
  try {
    var amount = request.body.amount;
    var Data = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Visa PayWay Demo Payment',
              description: 'Test card payment processed securely by Stripe'
            },
            unit_amount:amount, // Amount in cents (e.g., $10.00)
          },
          quantity: 1
        }
      ],
      success_url: `${appUrl}/api/v1/cardpayway/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
    }

    const session = await stripeInstance.checkout.sessions.create(Data);

    response.json({
      message: 'Checkout session created successfully!',
      url: session.url
    });

  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: 'Unable to create checkout session. Check your Stripe keys and server logs.'
    });
  }
}

const getSessionDetails = async (sessionId) => {
  const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent.payment_method']
  });

  return {
    id: session.id,
    amount_total: session.amount_total,
    currency: session.currency,
    payment_status: session.payment_status,
    customer_email: session.customer_details?.email || null,
    card_brand: session.payment_intent?.payment_method?.card?.brand || null,
    last4: session.payment_intent?.payment_method?.card?.last4 || null
  };
}

// Stripe redirects here after payment. Confirms the real status with
// Stripe and responds with the session data.
const PaymentSuccess = async (request, response) => {
  const sessionId = request.query.session_id;
  if (!sessionId) {
    return response.status(400).json({ error: 'Missing session_id.' });
  }
  try {
    const data = await getSessionDetails(sessionId);
    response.json(data);
  } catch (error) {
    console.error(error);
    response.status(404).json({ error: 'Checkout session not found.' });
  }
}



// ─── KHQR (Bakong) ───
// Flow:
//   1. generateKHQR       → prices the cart from DB, saves Sale + SaleItems (status "pending")
//                           and a pending SalePayment holding the QR md5, returns the QR string.
//   2. checkPaymentStatus → frontend polls with sale_id. When Bakong confirms the md5 and the
//                           amount/currency/account match, the sale is completed: payment marked
//                           "completed", invoice (SaleReceipt) created, stock deducted.
//   3. cancelKHQR         → cashier closes the QR; sale is cancelled unless it was already paid.

const KHQR_EXPIRE_MS = 5 * 60 * 1000;       // QR valid for 5 minutes
const KHQR_GRACE_MS = 30 * 1000;            // extra time before we give up on a late payment
const KHR_EXCHANGE_RATE = Number(process.env.KHR_EXCHANGE_RATE) || 4100;

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getBakongConfig = () => ({
    accountId: process.env.BAKONG_ACCOUNT_ID,
    merchantName: process.env.MERCHANT_NAME || process.env.ACCOUNT_NAME,
    merchantCity: process.env.MERCHANT_CITY || "Phnom Penh",
});

// Amount the customer must pay in the QR currency (sale totals are stored in USD)
const toQrAmount = (usdAmount, currency) =>
    currency === "KHR" ? Math.round(usdAmount * KHR_EXCHANGE_RATE) : round2(usdAmount);

// payment_method "khqr" (allowed by chk_sale_pay_method, see sql/2026-10-22_add_khqr_payment_method.sql);
// reference_number carries "KHQR-<currency>:<md5 or Bakong hash>"
const KHQR_PAYMENT_METHOD = "khqr";
const KHQR_REF_PATTERN = /^KHQR-(USD|KHR):(.+)$/;

const parseKhqrReference = (reference) => {
    const match = KHQR_REF_PATTERN.exec(String(reference || ""));
    return match ? { currency: match[1], value: match[2] } : null;
};

const findKhqrPayment = (sale) =>
    (sale.payments || []).find((p) =>
        p.payment_method === KHQR_PAYMENT_METHOD && parseKhqrReference(p.reference_number));

const buildCompletedResponse = (sale, payment) => ({
    success: true,
    status: 'COMPLETED',
    isCompleted: true,
    data: {
        sale_id: sale.sale_id,
        sale_no: sale.sale_no,
        receipt_number: sale.receipt?.receipt_number || null,
        total_amount: Number(sale.total_amount),
        discount: Number(sale.discount),
        tax_amount: Number(sale.tax_amount),
        payment_method: 'KHQR',
        currency: parseKhqrReference(payment?.reference_number)?.currency || 'USD',
        reference_number: parseKhqrReference(payment?.reference_number)?.value || null,
        paid_at: payment?.payment_date || null,
    },
    message: 'Payment completed',
});

// Ask Bakong whether the QR (by md5) has been paid. Returns transaction data or null.
const fetchBakongTransaction = async (md5) => {
    const apiUrl = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh';
    const response = await axios.post(`${apiUrl}/v1/check_transaction_by_md5`, { md5 }, {
        headers: {
            'Authorization': `Bearer ${process.env.BAKONG_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
    });

    // Official response format: { responseCode: 0 = Success | 1 = Failed, responseMessage, data }
    if (response.data && response.data.responseCode === 0) {
        return response.data.data || {};
    }
    return null;
};

// Marks the sale paid, creates the invoice and deducts stock — all in one transaction.
// Locks the sale row so two concurrent polls cannot complete it twice.
const completeKhqrSale = async (saleId, transactionData) => {
    await sequelize.transaction(async (t) => {
        const sale = await Sale.findByPk(saleId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!sale || sale.status === 'completed') return;

        const items = await SaleItem.findAll({ where: { sale_id: saleId }, transaction: t });
        const payment = await SalePayment.findOne({
            where: { sale_id: saleId, status: 'pending' },
            transaction: t,
        });

        if (payment) {
            const reference = parseKhqrReference(payment.reference_number);
            await payment.update({
                status: 'completed',
                payment_date: new Date(),
                // keep the Bakong transaction hash for bank reconciliation
                reference_number: transactionData.hash
                    ? `KHQR-${reference.currency}:${transactionData.hash}`
                    : payment.reference_number,
            }, { transaction: t });
        }

        await sale.update({ status: 'completed' }, { transaction: t });

        await SaleReceipt.create({
            sale_id: sale.sale_id,
            receipt_number: `INV-${String(sale.sale_id).padStart(6, '0')}`,
            total_amount: sale.total_amount,
            tax_amount: sale.tax_amount,
        }, { transaction: t });

        // Money is already received, so deduct even if stock went short in the meantime
        for (const item of items) {
            await ProductMaster.decrement('quantity_stock', {
                by: item.quantity,
                where: { product_id: item.product_id },
                transaction: t,
            });
        }
    });
};

const loadSale = (saleId) => Sale.findByPk(saleId, {
    include: [
        { model: SalePayment, as: 'payments' },
        { model: SaleReceipt, as: 'receipt' },
    ],
});

// Checks Bakong for a pending KHQR sale and completes / expires / cancels it.
// Returns { httpStatus, body } so check and cancel share the same logic.
const syncKhqrSale = async (saleId, { cancelIfUnpaid = false } = {}) => {
    let sale = await loadSale(saleId);
    if (!sale) {
        return { httpStatus: 404, body: { success: false, message: 'Sale not found' } };
    }

    const payment = findKhqrPayment(sale);
    if (!payment) {
        return { httpStatus: 400, body: { success: false, message: 'This sale is not a KHQR payment' } };
    }

    if (sale.status === 'completed') {
        return { httpStatus: 200, body: buildCompletedResponse(sale, payment) };
    }
    if (sale.status !== 'pending') {
        return {
            httpStatus: 200,
            body: { success: false, status: sale.status.toUpperCase(), isCompleted: false, message: `Sale is ${sale.status}` },
        };
    }

    const { currency, value: md5 } = parseKhqrReference(payment.reference_number);
    const transactionData = await fetchBakongTransaction(md5);

    if (transactionData) {
        // Never trust "paid" alone — it must be OUR account, currency and amount
        const expectedAmount = toQrAmount(Number(sale.total_amount), currency);
        const isMatch =
            transactionData.toAccountId === getBakongConfig().accountId &&
            String(transactionData.currency).toUpperCase() === currency &&
            Math.abs(Number(transactionData.amount) - expectedAmount) < 0.01;

        if (!isMatch) {
            console.error(`KHQR mismatch sale_id=${saleId}: expected ${expectedAmount} ${currency}, got`, transactionData);
            return {
                httpStatus: 409,
                body: { success: false, status: 'MISMATCH', isCompleted: false, message: 'Payment received does not match this sale. Please contact a manager.' },
            };
        }

        await completeKhqrSale(sale.sale_id, transactionData);
        sale = await loadSale(saleId);
        return { httpStatus: 200, body: buildCompletedResponse(sale, findKhqrPayment(sale)) };
    }

    // Not paid yet
    const createdAt = new Date(payment.payment_date).getTime();
    const isExpired = Date.now() > createdAt + KHQR_EXPIRE_MS + KHQR_GRACE_MS;

    if (cancelIfUnpaid || isExpired) {
        // DB constraints: sale status ∈ completed/cancelled/pending, payment status ∈ completed/pending/failed
        await sequelize.transaction(async (t) => {
            await Sale.update({ status: 'cancelled' }, { where: { sale_id: saleId, status: 'pending' }, transaction: t });
            await SalePayment.update({ status: 'failed' }, { where: { sale_id: saleId, status: 'pending' }, transaction: t });
        });
        const reason = isExpired ? 'EXPIRED' : 'CANCELLED';
        return {
            httpStatus: 200,
            body: { success: false, status: reason, isCompleted: false, message: `KHQR ${reason.toLowerCase()}` },
        };
    }

    return {
        httpStatus: 200,
        body: {
            success: true,
            status: 'PENDING',
            isCompleted: false,
            expires_at: new Date(createdAt + KHQR_EXPIRE_MS).toISOString(),
            message: 'Waiting for customer payment',
        },
    };
};

// Bakong errors must not reach the client as 401, or the POS interceptor logs the cashier out
const handleBakongError = (res, error, controller) => {
    console.error("Bakong API error:", error.message);
    if (error.response) {
        console.error("Bakong responded:", error.response.status, JSON.stringify(error.response.data));
        return res.status(502).json({
            success: false,
            message: error.response.data?.responseMessage || error.response.data?.message || 'Bakong service error',
        });
    }
    if (['ECONNABORTED', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code)) {
        return res.status(502).json({ success: false, message: 'Cannot reach Bakong service. Please try again.' });
    }
    logError(res, error, controller);
};

//handle Create KHQR payment
// body: { items: [{ product_id, quantity }], discount_percent?, tax_percent?, customer_id?, currency?: "USD" | "KHR", notes? }
const generateKHQR = async (req, res) => {
    try {
        const { items, discount_percent = 0, tax_percent = 0, customer_id = null, notes = null } = req.body;
        const currency = String(req.body.currency || "USD").toUpperCase();

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart items are required' });
        }
        if (!["USD", "KHR"].includes(currency)) {
            return res.status(400).json({ success: false, message: 'Currency must be USD or KHR' });
        }
        const discountPercent = Number(discount_percent);
        const taxPercent = Number(tax_percent);
        if (!(discountPercent >= 0 && discountPercent <= 100) || !(taxPercent >= 0 && taxPercent <= 100)) {
            return res.status(400).json({ success: false, message: 'Discount and tax percent must be between 0 and 100' });
        }

        // Merge duplicate products and validate quantities
        const quantities = new Map();
        for (const item of items) {
            const productId = Number(item.product_id);
            const quantity = Number(item.quantity);
            if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Each item needs a valid product_id and quantity' });
            }
            quantities.set(productId, (quantities.get(productId) || 0) + quantity);
        }

        const bakong = getBakongConfig();
        if (!bakong.accountId || !bakong.merchantName) {
            return res.status(500).json({ success: false, message: 'KHQR is not configured. Set BAKONG_ACCOUNT_ID and MERCHANT_NAME in .env' });
        }

        // Price comes from the database, never from the client
        const products = await ProductMaster.findAll({
            where: { product_id: [...quantities.keys()], active: 1 },
        });
        if (products.length !== quantities.size) {
            return res.status(400).json({ success: false, message: 'Some products do not exist or are inactive' });
        }

        const lines = [];
        for (const product of products) {
            const quantity = quantities.get(product.product_id);
            if (product.quantity_stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product.product_name} (available: ${product.quantity_stock})`,
                });
            }
            const unitPrice = Number(product.price);
            if (!(unitPrice > 0)) { // DB constraint chk_sale_item_price
                return res.status(400).json({ success: false, message: `${product.product_name} has no price set` });
            }
            lines.push({
                product_id: product.product_id,
                quantity,
                unit_price: unitPrice,
                discount_percent: 0,
                total_price: round2(unitPrice * quantity),
            });
        }

        const subtotal = round2(lines.reduce((sum, line) => sum + line.total_price, 0));
        const discount = round2(subtotal * discountPercent / 100);
        const taxAmount = round2((subtotal - discount) * taxPercent / 100);
        const totalAmount = round2(subtotal - discount + taxAmount);
        const qrAmount = toQrAmount(totalAmount, currency);

        if (qrAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        const customerId = customer_id !== null && Number.isInteger(Number(customer_id)) ? Number(customer_id) : null;
        if (customerId !== null) { // FK tbl_sale.customer_id → tbl_customer_profile
            const [found] = await sequelize.query(
                "SELECT 1 FROM tbl_customer_profile WHERE customer_id = ? LIMIT 1",
                { replacements: [customerId], type: sequelize.QueryTypes.SELECT }
            );
            if (!found) {
                return res.status(400).json({ success: false, message: 'Customer not found' });
            }
        }

        const result = await sequelize.transaction(async (t) => {
            const sale = await Sale.create({
                sale_no: `TMP-${Date.now()}`,
                store_id: req.user.store_id || Number(process.env.DEFAULT_STORE_ID) || 1,
                user_id: req.user.user_id,
                customer_id: customerId,
                total_amount: totalAmount,
                discount,
                tax_amount: taxAmount,
                status: 'pending',
                notes,
            }, { transaction: t });

            const saleNo = `SO-${String(sale.sale_id).padStart(6, '0')}`;
            await sale.update({ sale_no: saleNo }, { transaction: t });

            await SaleItem.bulkCreate(
                lines.map((line) => ({ ...line, sale_id: sale.sale_id })),
                { transaction: t }
            );

            const optionalData = {
                currency: currency === "KHR" ? khqrData.currency.khr : khqrData.currency.usd,
                amount: qrAmount,
                billNumber: saleNo,
                mobileNumber: process.env.MERCHANT_PHONE || "",
                storeLabel: process.env.STORE_LABEL || "POS Store",
                terminalLabel: "POS-T1",
                expirationTimestamp: Date.now() + KHQR_EXPIRE_MS,
            };

            // bakong-khqr v1.x signature: (bakongAccountID, merchantName, merchantCity, optional)
            // An amount is what makes the QR *dynamic* (trackable by MD5); without it
            // Bakong returns "System does not support static QR code" on check-payment.
            const individualInfo = new IndividualInfo(bakong.accountId, bakong.merchantName, bakong.merchantCity, optionalData);
            const khqr = new BakongKHQR().generateIndividual(individualInfo);

            if (!khqr || !khqr.data) {
                throw new Error(`KHQR generation failed: ${khqr?.status?.message || 'unknown error'}`);
            }

            // Pending payment row keeps the md5 so we can verify it with Bakong later
            await SalePayment.create({
                sale_id: sale.sale_id,
                payment_method: KHQR_PAYMENT_METHOD,
                amount: totalAmount,
                status: 'pending',
                reference_number: `KHQR-${currency}:${khqr.data.md5}`,
            }, { transaction: t });

            return { sale, saleNo, khqr: khqr.data };
        });

        return res.status(200).json({
            success: true,
            data: {
                sale_id: result.sale.sale_id,
                sale_no: result.saleNo,
                qr: result.khqr.qr,       // The KHQR string to encode as QR image
                md5: result.khqr.md5,     // MD5 hash for verification
                merchantName: bakong.merchantName,
                currency,
                amount: qrAmount,
                subtotal,
                discount,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                expires_at: new Date(Date.now() + KHQR_EXPIRE_MS).toISOString(),
            },
            message: 'KHQR generated successfully',
        });

    } catch (error) {
        console.error("KHQR generation error:", error);
        logError(res, error, "payment.generateKHQR");
    }
};


// body: { sale_id }
const checkPaymentStatus = async (req, res) => {
    try {
        // Check if Bakong API is enabled
        if (process.env.BAKONG_API_ENABLED !== 'true') {
            return res.status(400).json({
                success: false,
                message: 'Bakong API verification is not enabled. Please configure BAKONG_API_TOKEN in .env',
            });
        }

        const saleId = Number(req.body.sale_id);
        if (!Number.isInteger(saleId)) {
            return res.status(400).json({ success: false, message: 'sale_id is required' });
        }

        const { httpStatus, body } = await syncKhqrSale(saleId);
        return res.status(httpStatus).json(body);

    } catch (error) {
        handleBakongError(res, error, "payment.checkPaymentStatus");
    }
};

// body: { sale_id } — checks one last time with Bakong so a just-paid sale is not cancelled
const cancelKHQR = async (req, res) => {
    try {
        const saleId = Number(req.body.sale_id);
        if (!Number.isInteger(saleId)) {
            return res.status(400).json({ success: false, message: 'sale_id is required' });
        }

        const { httpStatus, body } = await syncKhqrSale(saleId, { cancelIfUnpaid: true });
        return res.status(httpStatus).json(body);

    } catch (error) {
        handleBakongError(res, error, "payment.cancelKHQR");
    }
};

const verifyKHQR = async (req, res) => {
    try {
        const { qrString } = req.body;

        if (!qrString) {
            return res.status(400).json({
                success: false,
                message: 'QR string is required',
            });
        }

        const isValid = BakongKHQR.verify(qrString).isValid;
        const decoded = isValid ? BakongKHQR.decode(qrString) : null;

        return res.status(200).json({
            success: true,
            data: {
                isValid,
                decoded,
            },
        });
    } catch (error) {
        console.error("KHQR verify error:", error);
        logError(res, error, "payment.verifyKHQR");
    }
};
module.exports = { createCheckoutSession ,PaymentSuccess ,generateKHQR , verifyKHQR , checkPaymentStatus , cancelKHQR };
