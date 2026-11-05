const { Op } = require("sequelize");
const {
  CustomerProfile,
  CusOrder,
  CusOrderItem,
  CusPayment,
  CusPayInv,
  ProductMaster,
} = require("../models");
const logError = require("../helper/log_error");

// Helper to format order with computed fields (items_count, total_quantity, invoice, payment)
const formatOrder = (order) => {
  const raw = typeof order.toJSON === "function" ? order.toJSON() : order;
  const items = (raw.items || []).map((item) => {
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const totalPrice = Number(item.total_price) || qty * unitPrice;
    return {
      order_item_id: item.order_item_id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: qty,
      unit_price: unitPrice,
      total_price: totalPrice,
      product: item.product
        ? {
            product_id: item.product.product_id,
            product_name: item.product.product_name,
            sku: item.product.sku,
            image: item.product.image,
            price: Number(item.product.price) || 0,
            barcode: item.product.barcode,
            category_id: item.product.category_id,
            brand_id: item.product.brand_id,
          }
        : null,
    };
  });

  const items_count = items.length; // Distinct product item types in this order
  const total_quantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const payments = (raw.payments || []).map((p) => ({
    payment_id: p.payment_id,
    order_id: p.order_id,
    payment_date: p.payment_date,
    amount: Number(p.amount) || 0,
    payment_method: p.payment_method,
    status: p.status,
    reference_number: p.reference_number,
    created_date: p.created_date,
  }));

  const primaryPayment =
    payments.find((p) => p.status === "completed") || payments[0] || null;

  const invoice = raw.invoice
    ? {
        invoice_id: raw.invoice.invoice_id,
        order_id: raw.invoice.order_id,
        payment_id: raw.invoice.payment_id,
        invoice_number: raw.invoice.invoice_number,
        invoice_date: raw.invoice.invoice_date,
        amount: Number(raw.invoice.amount) || 0,
        tax_amount: Number(raw.invoice.tax_amount) || 0,
        created_date: raw.invoice.created_date,
      }
    : null;

  return {
    order_id: raw.order_id,
    order_no: raw.order_no,
    customer_id: raw.customer_id,
    store_id: raw.store_id,
    order_date: raw.order_date,
    total_amount: Number(raw.total_amount) || 0,
    discount: Number(raw.discount) || 0,
    status: raw.status,
    notes: raw.notes,
    created_date: raw.created_date,
    updated_date: raw.updated_date,
    items_count,
    total_quantity,
    customer: raw.customer || null,
    items,
    payments,
    primary_payment: primaryPayment,
    payment_method: primaryPayment ? primaryPayment.payment_method : null,
    payment_status: primaryPayment ? primaryPayment.status : "unpaid",
    invoice,
    invoice_number: invoice ? invoice.invoice_number : null,
  };
};

const defaultOrderIncludes = [
  {
    model: CustomerProfile,
    as: "customer",
    attributes: [
      "customer_id",
      "customer_name",
      "email",
      "phone",
      "address",
      "city",
      "country",
      "loyalty_points",
      "active",
    ],
  },
  {
    model: CusOrderItem,
    as: "items",
    include: [
      {
        model: ProductMaster,
        as: "product",
        attributes: [
          "product_id",
          "product_name",
          "sku",
          "image",
          "price",
          "barcode",
          "category_id",
          "brand_id",
        ],
      },
    ],
  },
  {
    model: CusPayment,
    as: "payments",
  },
  {
    model: CusPayInv,
    as: "invoice",
  },
];

// Admin-facing customer info (tbl_customer_profile). Password is excluded by the model's defaultScope.

// 1. GET ALL CUSTOMERS
// Query: search (name/email/phone), active (1/0/true/false), city, country
const getCustomers = async (req, res) => {
  try {
    const { search, active, city, country } = req.query;
    const whereClause = {};

    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { customer_name: { [Op.like]: keyword } },
        { email: { [Op.like]: keyword } },
        { phone: { [Op.like]: keyword } },
      ];
    }

    if (active !== undefined && active !== "" && active !== "all") {
      whereClause.active = active === "true" || active === "1" ? 1 : 0;
    }

    if (city && city.trim()) {
      whereClause.city = { [Op.like]: `%${city.trim()}%` };
    }

    if (country && country.trim()) {
      whereClause.country = { [Op.like]: `%${country.trim()}%` };
    }

    const customers = await CustomerProfile.findAll({
      where: whereClause,
      order: [["customer_id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      total: customers.length,
      list: customers,
    });
  } catch (error) {
    logError(res, error, "customer.getCustomers");
  }
};

// 2. GET ONE CUSTOMER BY ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });
    }

    const customer = await CustomerProfile.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    logError(res, error, "customer.getCustomerById");
  }
};

// 3. GET CUSTOMER ORDERS (All orders, optionally filtered by customer_id, status, search, date)
const getCustomerOrders = async (req, res) => {
  try {
    const { customer_id, status, search, start_date, end_date } = req.query;
    const whereClause = {};

    if (customer_id && customer_id !== "all") {
      whereClause.customer_id = customer_id;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (start_date && end_date) {
      whereClause.order_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    } else if (start_date) {
      whereClause.order_date = {
        [Op.gte]: new Date(start_date),
      };
    } else if (end_date) {
      whereClause.order_date = {
        [Op.lte]: new Date(end_date),
      };
    }

    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      const matchedCustomers = await CustomerProfile.findAll({
        where: {
          [Op.or]: [
            { customer_name: { [Op.like]: keyword } },
            { email: { [Op.like]: keyword } },
            { phone: { [Op.like]: keyword } },
          ],
        },
        attributes: ["customer_id"],
      });
      const customerIds = matchedCustomers.map((c) => c.customer_id);

      const matchedInvoices = await CusPayInv.findAll({
        where: { invoice_number: { [Op.like]: keyword } },
        attributes: ["order_id"],
      });
      const invoiceOrderIds = matchedInvoices.map((inv) => inv.order_id);

      const searchOrConditions = [{ order_no: { [Op.like]: keyword } }];
      if (customerIds.length > 0) {
        searchOrConditions.push({ customer_id: { [Op.in]: customerIds } });
      }
      if (invoiceOrderIds.length > 0) {
        searchOrConditions.push({ order_id: { [Op.in]: invoiceOrderIds } });
      }
      whereClause[Op.or] = searchOrConditions;
    }

    const orders = await CusOrder.findAll({
      where: whereClause,
      include: defaultOrderIncludes,
      order: [["order_id", "DESC"]],
    });

    const formattedOrders = orders.map(formatOrder);

    res.status(200).json({
      success: true,
      total: formattedOrders.length,
      list: formattedOrders,
    });
  } catch (error) {
    logError(res, error, "customer.getCustomerOrders");
  }
};

// 4. GET ONE CUSTOMER ORDER BY ORDER ID
const getCustomerOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id || isNaN(Number(order_id))) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required",
      });
    }

    const order = await CusOrder.findByPk(order_id, {
      include: defaultOrderIncludes,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${order_id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: formatOrder(order),
    });
  } catch (error) {
    logError(res, error, "customer.getCustomerOrderById");
  }
};

// 5. GET ALL ORDERS FOR A SPECIFIC CUSTOMER (by customer_id)
const getOrdersByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });
    }

    const customer = await CustomerProfile.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found`,
      });
    }

    const orders = await CusOrder.findAll({
      where: { customer_id: id },
      include: defaultOrderIncludes,
      order: [["order_id", "DESC"]],
    });

    const formattedOrders = orders.map(formatOrder);

    const completedOrders = formattedOrders.filter((o) => o.status === "completed");
    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalItems = formattedOrders.reduce((sum, o) => sum + (o.total_quantity || 0), 0);

    res.status(200).json({
      success: true,
      customer,
      summary: {
        total_orders: formattedOrders.length,
        total_spent: totalSpent,
        completed_orders: completedOrders.length,
        pending_orders: formattedOrders.filter((o) => o.status === "pending").length,
        cancelled_orders: formattedOrders.filter((o) => o.status === "cancelled").length,
        total_items: totalItems,
      },
      orders: formattedOrders,
    });
  } catch (error) {
    logError(res, error, "customer.getOrdersByCustomerId");
  }
};

// 6. GET CUSTOMERS SUMMARY (Customers with their orders overview)
const getCustomersWithOrders = async (req, res) => {
  try {
    const { search, has_orders } = req.query;
    const customerWhere = {};

    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      customerWhere[Op.or] = [
        { customer_name: { [Op.like]: keyword } },
        { email: { [Op.like]: keyword } },
        { phone: { [Op.like]: keyword } },
      ];
    }

    const customers = await CustomerProfile.findAll({
      where: customerWhere,
      include: [
        {
          model: CusOrder,
          as: "orders",
          include: defaultOrderIncludes.filter((inc) => inc.as !== "customer"),
        },
      ],
      order: [
        ["customer_id", "DESC"],
        [{ model: CusOrder, as: "orders" }, "order_id", "DESC"],
      ],
    });

    let list = customers.map((c) => {
      const raw = c.toJSON();
      const orders = (raw.orders || []).map(formatOrder);
      const completedOrders = orders.filter((o) => o.status === "completed");
      const totalSpent = completedOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
      const totalItems = orders.reduce((s, o) => s + (o.total_quantity || 0), 0);

      return {
        customer_id: raw.customer_id,
        customer_name: raw.customer_name,
        email: raw.email,
        phone: raw.phone,
        address: raw.address,
        city: raw.city,
        country: raw.country,
        loyalty_points: raw.loyalty_points,
        active: raw.active,
        created_date: raw.created_date,
        orders_count: orders.length,
        total_spent: totalSpent,
        total_items: totalItems,
        latest_order: orders[0] || null,
        orders,
      };
    });

    if (has_orders === "true" || has_orders === "1") {
      list = list.filter((c) => c.orders_count > 0);
    }

    res.status(200).json({
      success: true,
      total: list.length,
      list,
    });
  } catch (error) {
    logError(res, error, "customer.getCustomersWithOrders");
  }
};

// 7. UPDATE ORDER STATUS (e.g. pending -> completed / cancelled)
const updateCustomerOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["pending", "completed", "cancelled", "processing", "shipped", "delivered"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const order = await CusOrder.findByPk(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${order_id} not found`,
      });
    }

    const updates = { status };
    if (notes !== undefined) updates.notes = notes;
    await order.update(updates);

    const updated = await CusOrder.findByPk(order_id, {
      include: defaultOrderIncludes,
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: formatOrder(updated),
    });
  } catch (error) {
    logError(res, error, "customer.updateCustomerOrderStatus");
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  getCustomerOrders,
  getCustomerOrderById,
  getOrdersByCustomerId,
  getCustomersWithOrders,
  updateCustomerOrderStatus,
};
