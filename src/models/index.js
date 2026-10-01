const { sequelize } = require("../config/sequelizeConfig");
const Category = require("./category.model");
const Brand = require("./brand.model");
const Attribute = require("./attribute.model");
const ProductMaster = require("./productMaster.model");

// Associations / Relationships
ProductMaster.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(ProductMaster, { foreignKey: "category_id", as: "products" });

ProductMaster.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
Brand.hasMany(ProductMaster, { foreignKey: "brand_id", as: "products" });

ProductMaster.belongsTo(Attribute, { foreignKey: "attribute_id", as: "attribute" });
Attribute.hasMany(ProductMaster, { foreignKey: "attribute_id", as: "products" });

module.exports = {
  sequelize,
  Category,
  Brand,
  Attribute,
  ProductMaster,
};
