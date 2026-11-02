const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelizeConfig");

const CustomerCart = sequelize.define(
  "CustomerCart",
  {
    cart_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tbl_customer_cart",
    timestamps: true,
    createdAt: "created_date",
    updatedAt: "updated_date",
    indexes: [{ unique: true, fields: ["customer_id", "product_id"] }],
  }
);

module.exports = CustomerCart;
