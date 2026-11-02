const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelizeConfig");

const CusPayment = sequelize.define(
  "CusPayment",
  {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "completed",
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tbl_cus_payment",
    timestamps: true,
    createdAt: "created_date",
    updatedAt: false,
  }
);

module.exports = CusPayment;
