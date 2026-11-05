const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelizeConfig");

const GeneralSetting = sequelize.define(
  "GeneralSetting",
  {
    setting_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    setting_value: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    setting_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    store_scope: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // MySQL STORED GENERATED column: GENERATED ALWAYS AS (ifnull(store_id, 0)) STORED
    },
  },
  {
    tableName: "tbl_general_setting",
    timestamps: true,
    createdAt: "created_date",
    updatedAt: "updated_date",
    hooks: {
      // Prevent MySQL error: "The value specified for generated column 'store_scope' is not allowed"
      beforeCreate: (instance) => {
        delete instance.dataValues.store_scope;
        if (instance._changed) {
          instance._changed.delete("store_scope");
        }
      },
      beforeUpdate: (instance) => {
        delete instance.dataValues.store_scope;
        if (instance._changed) {
          instance._changed.delete("store_scope");
        }
      },
    },
  }
);

module.exports = GeneralSetting;

