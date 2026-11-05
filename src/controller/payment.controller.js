const stripe = require('stripe');
require('dotenv').config();
const axios = require('axios');
const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");
const {
    sequelize, ProductMaster, Sale, SaleItem, SalePayment, SaleReceipt,
    CustomerCart, CusOrder, CusOrderItem, CusPayment, CusPayInv, CustomerProfile,
} = require("../models");
const { transporter } = require("../helper/mail_config");
const logError = require("../helper/log_error");
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
const appUrl = process.env.CLIENT_URL||'http://localhost:3000';

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


// ─── Storefront card payment (Stripe Checkout) ───
// Flow:
//   1. cardCheckout      → prices the customer's cart from DB, saves CusOrder + CusOrderItems (status "pending")
//                          and a pending CusPayment (method "card", reference = Stripe session id),
//                          returns the Stripe hosted checkout URL.
//   2. cardVerify        → Stripe redirects the customer to /index/checkout/success?session_id=...;
//                          the page calls this. When Stripe says "paid" and the amount matches, the order is
//                          completed: payment "completed", invoice (CusPayInv) created, stock deducted,
//                          purchased items removed from the cart. Safe to call more than once.
//   3. cardCancel        → customer pressed "back" on Stripe; pending order is cancelled.

const CARD_PAYMENT_METHOD = "card";
const toCents = (usd) => Math.round(Number(usd) * 100);

const loadCustomerOrder = (orderId) => CusOrder.findByPk(orderId, {
    include: [
        { model: CusOrderItem, as: 'items', include: [{ model: ProductMaster, as: 'product', attributes: ['product_id', 'product_name', 'sku', 'image'] }] },
        { model: CusPayment, as: 'payments' },
        { model: CusPayInv, as: 'invoice' },
    ],
});

const buildOrderResponse = (order, session) => {
    const payment = (order.payments || []).find((p) => p.payment_method === CARD_PAYMENT_METHOD);
    return {
        order_id: order.order_id,
        order_no: order.order_no,
        status: order.status,
        total_amount: Number(order.total_amount),
        invoice_number: order.invoice?.invoice_number || null,
        paid_at: payment?.status === 'completed' ? payment.payment_date : null,
        payment_method: 'CARD',
        card_brand: session?.payment_intent?.payment_method?.card?.brand || null,
        card_last4: session?.payment_intent?.payment_method?.card?.last4 || null,
        items: (order.items || []).map((item) => ({
            product_id: item.product_id,
            product_name: item.product?.product_name || null,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total_price: Number(item.total_price),
        })),
    };
};

// Marks the order paid, creates the invoice, deducts stock and removes the bought items from the cart.
// Locks the order row so two concurrent verify calls cannot complete it twice.
// Returns true only for the call that actually completed the order (used to send the email once).
const completeCardOrder = async (orderId, session) => {
    return sequelize.transaction(async (t) => {
        const order = await CusOrder.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!order || order.status === 'completed') return false;

        const items = await CusOrderItem.findAll({ where: { order_id: orderId }, transaction: t });
        let payment = await CusPayment.findOne({
            where: { order_id: orderId, payment_method: CARD_PAYMENT_METHOD },
            order: [['payment_id', 'DESC']],
            transaction: t,
        });

        if (payment) {
            await payment.update({ status: 'completed', payment_date: new Date() }, { transaction: t });
        } else {
            payment = await CusPayment.create({
                order_id: orderId,
                amount: order.total_amount,
                payment_method: CARD_PAYMENT_METHOD,
                status: 'completed',
                reference_number: session.id,
            }, { transaction: t });
        }

        // Money is already received: even if the order was cancelled meanwhile, it becomes completed
        await order.update({ status: 'completed' }, { transaction: t });

        await CusPayInv.create({
            order_id: orderId,
            payment_id: payment.payment_id,
            invoice_number: `CINV-${String(orderId).padStart(6, '0')}`,
            amount: order.total_amount,
            tax_amount: 0,
        }, { transaction: t });

        for (const item of items) {
            await ProductMaster.decrement('quantity_stock', {
                by: item.quantity,
                where: { product_id: item.product_id },
                transaction: t,
            });
        }

        await CustomerCart.destroy({
            where: { customer_id: order.customer_id, product_id: items.map((i) => i.product_id) },
            transaction: t,
        });
        return true;
    });
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const usd = (amount) => `$${Number(amount).toFixed(2)}`;

// Payment confirmation / receipt email to the customer (Gmail transporter from helper/mail_config).
// Never throws: a mail failure must not fail a payment that already succeeded.
const sendCardPaymentEmail = async (order, session) => {
    try {
        if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
            console.warn(`Payment email skipped for ${order.order_no}: EMAIL / APP_PASSWORD not set in .env`);
            return;
        }
        const customer = await CustomerProfile.findByPk(order.customer_id, { attributes: ['customer_name', 'email'] });
        const to = customer?.email || session.customer_details?.email;
        if (!to) return;

        const data = buildOrderResponse(order, session);
        const card = data.card_brand ? `${data.card_brand.toUpperCase()} •••• ${data.card_last4}` : 'Card';
        const paidAt = data.paid_at ? new Date(data.paid_at).toLocaleString('en-US') : '';
        const rows = data.items.map((item) => `
            <tr>
                <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(item.product_name || `Product #${item.product_id}`)}</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${usd(item.unit_price)}</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${usd(item.total_price)}</td>
            </tr>`).join('');

        await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: `Payment received – Order ${data.order_no}`,
            html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
                <h2 style="margin-bottom:4px">Thank you for your order!</h2>
                <p>Hi ${escapeHtml(customer?.customer_name || 'there')},</p>
                <p>We have received your card payment. Here is your receipt:</p>
                <table style="width:100%;font-size:14px;margin:12px 0">
                    <tr><td>Order no.</td><td style="text-align:right"><b>${escapeHtml(data.order_no)}</b></td></tr>
                    <tr><td>Invoice</td><td style="text-align:right">${escapeHtml(data.invoice_number || '-')}</td></tr>
                    <tr><td>Paid with</td><td style="text-align:right">${escapeHtml(card)}</td></tr>
                    <tr><td>Paid at</td><td style="text-align:right">${escapeHtml(paidAt)}</td></tr>
                </table>
                <table style="width:100%;font-size:14px;border-collapse:collapse">
                    <thead><tr style="text-align:left;color:#666">
                        <th style="padding:8px 0;border-bottom:2px solid #ddd">Item</th>
                        <th style="padding:8px 0;border-bottom:2px solid #ddd;text-align:center">Qty</th>
                        <th style="padding:8px 0;border-bottom:2px solid #ddd;text-align:right">Price</th>
                        <th style="padding:8px 0;border-bottom:2px solid #ddd;text-align:right">Total</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <p style="text-align:right;font-size:16px"><b>Total paid: ${usd(data.total_amount)}</b></p>
                <p style="color:#666;font-size:13px">If you have any questions about this order, just reply to this email.</p>
            </div>`,
        });
        console.log(`Payment email sent for ${data.order_no} to ${to}`);
    } catch (error) {
        console.error(`Payment email failed for order ${order?.order_no}:`, error.message);
    }
};

// POST /api/v1/cardpayway/checkout  (customer token) — body: { notes? }
const cardCheckout = async (req, res) => {
    let orderId = null;
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ success: false, message: 'Card payment is not configured. Set STRIPE_SECRET_KEY in .env' });
        }

        const customerId = req.customer.customer_id;
        const notes = req.body?.notes ? String(req.body.notes).slice(0, 500) : null;

        // Price comes from the database cart, never from the client
        const cartItems = await CustomerCart.findAll({
            where: { customer_id: customerId },
            include: [{ model: ProductMaster, as: 'product' }],
        });
        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }

        const lines = [];
        for (const item of cartItems) {
            const product = item.product;
            if (!product || product.active !== 1) {
                return res.status(400).json({ success: false, message: `Product #${item.product_id} is no longer available. Please remove it from your cart.` });
            }
            if (product.quantity_stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: product.quantity_stock > 0
                        ? `Only ${product.quantity_stock} unit(s) of ${product.product_name} in stock`
                        : `${product.product_name} is out of stock`,
                });
            }
            const unitPrice = round2(product.price);
            if (!(unitPrice > 0)) { // DB constraint chk_cus_oitem_price
                return res.status(400).json({ success: false, message: `${product.product_name} has no price set` });
            }
            lines.push({
                product,
                product_id: product.product_id,
                quantity: item.quantity,
                unit_price: unitPrice,
                total_price: round2(unitPrice * item.quantity),
            });
        }

        const totalAmount = round2(lines.reduce((sum, line) => sum + line.total_price, 0));
        if (toCents(totalAmount) < 50) { // Stripe minimum charge is $0.50
            return res.status(400).json({ success: false, message: 'Order total must be at least $0.50 for card payment' });
        }

        const order = await sequelize.transaction(async (t) => {
            const created = await CusOrder.create({
                order_no: `TMP-${Date.now()}-${customerId}`,
                customer_id: customerId,
                total_amount: totalAmount,
                discount: 0,
                status: 'pending',
                notes,
            }, { transaction: t });

            await created.update({ order_no: `CO-${String(created.order_id).padStart(6, '0')}` }, { transaction: t });

            await CusOrderItem.bulkCreate(
                lines.map(({ product, ...line }) => ({ ...line, order_id: created.order_id })),
                { transaction: t }
            );
            return created;
        });
        orderId = order.order_id;

        const session = await stripeInstance.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            client_reference_id: String(order.order_id),
            customer_email: req.customer.email || undefined,
            metadata: { order_id: String(order.order_id), order_no: order.order_no, customer_id: String(customerId) },
            line_items: lines.map((line) => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: line.product.product_name, ...(line.product.sku ? { description: `SKU: ${line.product.sku}` } : {}) },
                    unit_amount: toCents(line.unit_price),
                },
                quantity: line.quantity,
            })),
            success_url: `${appUrl}/index/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/index/cart?payment=cancelled&order_id=${order.order_id}`,
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes (Stripe minimum)
        });

        await CusPayment.create({
            order_id: order.order_id,
            amount: totalAmount,
            payment_method: CARD_PAYMENT_METHOD,
            status: 'pending',
            reference_number: session.id,
        });

        return res.status(200).json({
            success: true,
            data: {
                order_id: order.order_id,
                order_no: order.order_no,
                total_amount: totalAmount,
                session_id: session.id,
                url: session.url,
            },
            message: 'Checkout session created',
        });
    } catch (error) {
        console.error("Card checkout error:", error.message);
        // Don't leave a pending order behind when Stripe rejected the session
        if (orderId) {
            await CusOrder.update({ status: 'cancelled' }, { where: { order_id: orderId, status: 'pending' } }).catch(() => {});
        }
        if (error.type && String(error.type).startsWith('Stripe')) {
            return res.status(502).json({ success: false, message: error.message || 'Stripe service error' });
        }
        logError(res, error, "payment.cardCheckout");
    }
};

// GET /api/v1/cardpayway/checkout/verify?session_id=cs_...  (customer token)
const cardVerify = async (req, res) => {
    try {
        const sessionId = String(req.query.session_id || '');
        if (!sessionId.startsWith('cs_')) {
            return res.status(400).json({ success: false, message: 'session_id is required' });
        }

        const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent.payment_method'],
        });

        const orderId = Number(session.metadata?.order_id);
        let order = Number.isInteger(orderId) ? await loadCustomerOrder(orderId) : null;
        if (!order || order.customer_id !== req.customer.customer_id) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status === 'completed') {
            return res.status(200).json({ success: true, status: 'COMPLETED', data: buildOrderResponse(order, session), message: 'Payment completed' });
        }

        if (session.payment_status !== 'paid') {
            return res.status(200).json({
                success: false,
                status: session.status === 'expired' ? 'EXPIRED' : 'UNPAID',
                data: buildOrderResponse(order, session),
                message: 'Payment has not been completed',
            });
        }

        // Never trust "paid" alone — amount and currency must match the order
        const isMatch = session.currency === 'usd' && session.amount_total === toCents(order.total_amount);
        if (!isMatch) {
            console.error(`Card payment mismatch order_id=${orderId}: expected ${toCents(order.total_amount)} usd, got ${session.amount_total} ${session.currency}`);
            return res.status(409).json({ success: false, status: 'MISMATCH', message: 'Payment received does not match this order. Please contact support.' });
        }

        const completedNow = await completeCardOrder(orderId, session);
        order = await loadCustomerOrder(orderId);
        if (completedNow) {
            sendCardPaymentEmail(order, session); // fire-and-forget, don't make the customer wait for SMTP
        }
        return res.status(200).json({ success: true, status: 'COMPLETED', data: buildOrderResponse(order, session), message: 'Payment completed' });
    } catch (error) {
        if (error.type === 'StripeInvalidRequestError') {
            return res.status(404).json({ success: false, message: 'Checkout session not found' });
        }
        logError(res, error, "payment.cardVerify");
    }
};

// POST /api/v1/cardpayway/checkout/cancel  (customer token) — body: { order_id }
const cardCancel = async (req, res) => {
    try {
        const orderId = Number(req.body?.order_id);
        if (!Number.isInteger(orderId)) {
            return res.status(400).json({ success: false, message: 'order_id is required' });
        }

        const order = await CusOrder.findByPk(orderId);
        if (!order || order.customer_id !== req.customer.customer_id) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.status !== 'pending') {
            return res.status(200).json({ success: true, status: order.status.toUpperCase(), message: `Order is ${order.status}` });
        }

        const payment = await CusPayment.findOne({
            where: { order_id: orderId, payment_method: CARD_PAYMENT_METHOD, status: 'pending' },
        });

        // Check one last time with Stripe so a just-paid order is never cancelled
        if (payment?.reference_number) {
            const session = await stripeInstance.checkout.sessions.retrieve(payment.reference_number);
            if (session.payment_status === 'paid') {
                return res.status(200).json({ success: true, status: 'PAID', message: 'This order is already paid' });
            }
            if (session.status === 'open') {
                await stripeInstance.checkout.sessions.expire(session.id).catch(() => {});
            }
        }

        await sequelize.transaction(async (t) => {
            await CusOrder.update({ status: 'cancelled' }, { where: { order_id: orderId, status: 'pending' }, transaction: t });
            await CusPayment.update({ status: 'failed' }, { where: { order_id: orderId, status: 'pending' }, transaction: t });
        });

        return res.status(200).json({ success: true, status: 'CANCELLED', message: 'Order cancelled' });
    } catch (error) {
        logError(res, error, "payment.cardCancel");
    }
};

module.exports = {
    createCheckoutSession, PaymentSuccess,
    cardCheckout, cardVerify, cardCancel,
    generateKHQR, verifyKHQR, checkPaymentStatus, cancelKHQR,
};
