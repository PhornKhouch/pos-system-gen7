const { sequelize } = require("../config/sequelizeConfig");
const Category = require("./category.model");
const Brand = require("./brand.model");
const Attribute = require("./attribute.model");
const ProductMaster = require("./productMaster.model");
const ProductImage = require("./productImage.model");
const User = require("./user.model");
const Sale = require("./sale.model");
const SaleItem = require("./saleItem.model");
const SalePayment = require("./salePayment.model");
const SaleReceipt = require("./saleReceipt.model");
const CustomerProfile = require("./customerProfile.model");
const CusOrder = require("./cusOrder.model");
const CusOrderItem = require("./cusOrderItem.model");
const CusPayment = require("./cusPayment.model");
const CusPayInv = require("./cusPayInv.model");
const CustomerCart = require("./customerCart.model");

// Associations / Relationships
ProductMaster.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(ProductMaster, { foreignKey: "category_id", as: "products" });

ProductMaster.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
Brand.hasMany(ProductMaster, { foreignKey: "brand_id", as: "products" });

ProductMaster.belongsTo(Attribute, { foreignKey: "attribute_id", as: "attribute" });
Attribute.hasMany(ProductMaster, { foreignKey: "attribute_id", as: "products" });

ProductImage.belongsTo(ProductMaster, { foreignKey: "product_id", as: "product" });
ProductMaster.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });

// Sale Relationships
Sale.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Sale, { foreignKey: "user_id", as: "sales" });

Sale.belongsTo(CustomerProfile, { foreignKey: "customer_id", as: "customer" });
CustomerProfile.hasMany(Sale, { foreignKey: "customer_id", as: "sales" });

Sale.hasMany(SaleItem, { foreignKey: "sale_id", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });

SaleItem.belongsTo(ProductMaster, { foreignKey: "product_id", as: "product" });
ProductMaster.hasMany(SaleItem, { foreignKey: "product_id", as: "sale_items" });

Sale.hasMany(SalePayment, { foreignKey: "sale_id", as: "payments" });
SalePayment.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });

Sale.hasOne(SaleReceipt, { foreignKey: "sale_id", as: "receipt" });
SaleReceipt.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });

// Customer Order Relationships
CusOrder.belongsTo(CustomerProfile, { foreignKey: "customer_id", as: "customer" });
CustomerProfile.hasMany(CusOrder, { foreignKey: "customer_id", as: "orders" });

CusOrder.hasMany(CusOrderItem, { foreignKey: "order_id", as: "items" });
CusOrderItem.belongsTo(CusOrder, { foreignKey: "order_id", as: "order" });

CusOrderItem.belongsTo(ProductMaster, { foreignKey: "product_id", as: "product" });
ProductMaster.hasMany(CusOrderItem, { foreignKey: "product_id", as: "cus_order_items" });

CusOrder.hasMany(CusPayment, { foreignKey: "order_id", as: "payments" });
CusPayment.belongsTo(CusOrder, { foreignKey: "order_id", as: "order" });

CusOrder.hasOne(CusPayInv, { foreignKey: "order_id", as: "invoice" });
CusPayInv.belongsTo(CusOrder, { foreignKey: "order_id", as: "order" });

CusPayInv.belongsTo(CusPayment, { foreignKey: "payment_id", as: "payment" });
CusPayment.hasOne(CusPayInv, { foreignKey: "payment_id", as: "invoice" });

// Customer Cart Relationships (storefront)
CustomerCart.belongsTo(CustomerProfile, { foreignKey: "customer_id", as: "customer" });
CustomerProfile.hasMany(CustomerCart, { foreignKey: "customer_id", as: "cart_items" });

CustomerCart.belongsTo(ProductMaster, { foreignKey: "product_id", as: "product" });
ProductMaster.hasMany(CustomerCart, { foreignKey: "product_id", as: "cart_items" });

module.exports = {
  sequelize,
  Category,
  Brand,
  Attribute,
  ProductMaster,
  ProductImage,
  User,
  Sale,
  SaleItem,
  SalePayment,
  Payment: SalePayment,
  SaleReceipt,
  Receipt: SaleReceipt,
  Invoice: SaleReceipt,
  CustomerProfile,
  Customer: CustomerProfile,
  CusOrder,
  CustomerOrder: CusOrder,
  CusOrderItem,
  CustomerOrderItem: CusOrderItem,
  CusPayment,
  CustomerPayment: CusPayment,
  CusPayInv,
  CustomerInvoice: CusPayInv,
  CusInvoice: CusPayInv,
  CustomerCart,
};
