var express = require('express');
const cors = require("cors");
const path = require("path");
var  { sequelize } = require('./src/config/sequelizeConfig');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static assets (images/uploads)
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));
app.use('/src/assets', express.static(path.join(__dirname, 'src/assets')));
var userRoute = require('./src/route/user.route');
var categoryRoute = require('./src/route/category.route');
var brandRoute = require('./src/route/brand.route');
var attributeRoute = require('./src/route/attribute.route');
var productMasterRoute = require('./src/route/productMaster.route');
var productImageRoute = require('./src/route/productImage.route');
var customerRoute = require('./src/route/customer.route');
var paymentRoute = require('./src/route/payment.route');
var saleRoute = require('./src/route/sale.route');
var generalSettingRoute = require('./src/route/generalSetting.route');

//import models
const {
  Category,
  Brand,
  Attribute,
  ProductMaster,
  User,
} = require('./src/models');
userRoute(app);
categoryRoute(app);
brandRoute(app);
attributeRoute(app);
productMasterRoute(app);
productImageRoute(app);
customerRoute(app);
paymentRoute(app);
saleRoute(app);
generalSettingRoute(app);
// auto sync models
sequelize.sync().then(() => {
    console.log("Database synced!");
}).catch(err => {
    console.log("Sync error:", err);
});

//runing server
app.listen(5000, ()=>{
    console.log("server is running on http://localhost:5000")
})