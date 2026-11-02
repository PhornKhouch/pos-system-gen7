const { CustomerCart, ProductMaster } = require("../models");
const logError = require("../helper/log_error");

const PRODUCT_ATTRIBUTES = ["product_id", "product_name", "sku", "price", "image", "quantity_stock", "active"];

const parseQuantity = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const qty = parseInt(value, 10);
  return Number.isInteger(qty) ? qty : NaN;
};

// Cart rows + totals for the logged-in customer
const buildCart = async (customer_id) => {
  const items = await CustomerCart.findAll({
    where: { customer_id },
    include: [{ model: ProductMaster, as: "product", attributes: PRODUCT_ATTRIBUTES }],
    order: [["updated_date", "DESC"]],
  });

  const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.product?.price) || 0) * item.quantity,
    0
  );

  return {
    items,
    total_items: items.length,
    total_quantity,
    subtotal: Math.round(subtotal * 100) / 100,
  };
};

// Product must exist, be active and have enough stock
const checkProduct = async (product_id, quantity) => {
  const product = await ProductMaster.findByPk(product_id);
  if (!product || product.active !== 1) {
    return { status: 404, message: `Product with ID ${product_id} is not available` };
  }
  if (quantity > product.quantity_stock) {
    return {
      status: 400,
      message:
        product.quantity_stock > 0
          ? `Only ${product.quantity_stock} unit(s) of ${product.product_name} in stock`
          : `${product.product_name} is out of stock`,
    };
  }
  return null;
};

// 1. GET CART
const getCart = async (req, res) => {
  try {
    const cart = await buildCart(req.customer.customer_id);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    logError(res, error, "customerCart.getCart");
  }
};

// 2. ADD TO CART (adds to the quantity if the product is already in the cart)
const addToCart = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const { product_id } = req.body;
    const quantity = parseQuantity(req.body.quantity, 1);

    if (!product_id) {
      return res.status(400).json({ success: false, message: "product_id is required" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const existing = await CustomerCart.findOne({ where: { customer_id, product_id } });
    const newQuantity = (existing ? existing.quantity : 0) + quantity;

    const problem = await checkProduct(product_id, newQuantity);
    if (problem) {
      return res.status(problem.status).json({ success: false, message: problem.message });
    }

    if (existing) {
      await existing.update({ quantity: newQuantity });
    } else {
      await CustomerCart.create({ customer_id, product_id: Number(product_id), quantity });
    }

    const cart = await buildCart(customer_id);
    res.status(200).json({ success: true, message: "Added to cart", data: cart });
  } catch (error) {
    logError(res, error, "customerCart.addToCart");
  }
};

// 3. UPDATE QUANTITY OF A CART ITEM
const updateCartItem = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const product_id = req.params.product_id;
    const quantity = parseQuantity(req.body.quantity, NaN);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const item = await CustomerCart.findOne({ where: { customer_id, product_id } });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item is not in your cart" });
    }

    const problem = await checkProduct(product_id, quantity);
    if (problem) {
      return res.status(problem.status).json({ success: false, message: problem.message });
    }

    await item.update({ quantity });

    const cart = await buildCart(customer_id);
    res.status(200).json({ success: true, message: "Cart updated", data: cart });
  } catch (error) {
    logError(res, error, "customerCart.updateCartItem");
  }
};

// 4. REMOVE ITEM FROM CART
const removeCartItem = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    await CustomerCart.destroy({ where: { customer_id, product_id: req.params.product_id } });

    const cart = await buildCart(customer_id);
    res.status(200).json({ success: true, message: "Item removed", data: cart });
  } catch (error) {
    logError(res, error, "customerCart.removeCartItem");
  }
};

// 5. CLEAR CART
const clearCart = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    await CustomerCart.destroy({ where: { customer_id } });

    const cart = await buildCart(customer_id);
    res.status(200).json({ success: true, message: "Cart cleared", data: cart });
  } catch (error) {
    logError(res, error, "customerCart.clearCart");
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
