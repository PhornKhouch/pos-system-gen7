var express = require('express');
const cors = require("cors");
var  { sequelize } = require('./src/config/sequelizeConfig');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// var userRoute = require('./src/route/user.route');
var categoryRoute = require('./src/route/category.route');
var brandRoute = require('./src/route/brand.route');
var attributeRoute = require('./src/route/attribute.route');
var productMasterRoute = require('./src/route/productMaster.route');

//import models
const {
  Category,
  Brand,
  Attribute,
  ProductMaster,
} = require('./src/models');

// userRoute(app);
categoryRoute(app);
brandRoute(app);
attributeRoute(app);
productMasterRoute(app);

// auto sync models
sequelize.sync({ alter: true }).then(() => {
    console.log("Database synced!");
}).catch(err => {
    console.log("Sync error:", err);
});

//runing server
app.listen(3000, ()=>{
    console.log("server is running on http://localhost:3000")
})