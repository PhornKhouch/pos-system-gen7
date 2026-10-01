// var {
//   getuser,
//   createUser,
//   login,
//   SendOTP,
//   verify_Otp,
//   setNewPassword,
//   GetUserV2,
// } = require("../controller/user.controller");
// var { validate_token } = require("../middleware/auth");
// var {
//   initiateGoogleAuth,
//   handleGoogleCallback,
//   verifyGoogleCredential,
// } = require("../controller/auth.controller.js");
// // var { requireAuth } = require('../middleware/auth.middleware.js');
// function UserRoute(app) {
//   //define routes
//   app.get("/api/v1/user/getall", validate_token(), getuser);

//   app.post("/api/v1/user/create", createUser);

//   app.post("/api/v1/user/login", login);

//   //send otp to email
//   app.post("/api/v1/user/send-otp", SendOTP);
//   //verify otp
//   app.post("/api/v1/user/verify-otp", verify_Otp);
//   //set new password
//   app.post("/api/v1/user/set-new-password", setNewPassword);

//   //testing new user route with sequelize

//   app.get("/api/v2/user/getAll", GetUserV2);

//   // goole auth 2.0
//   app.get("/api/v1/auth/google", initiateGoogleAuth);

//   app.get("/api/v1/auth/google/callback", handleGoogleCallback);

//   // app.post("/api/v1/auth/google/verify", verifyGoogleCredential);

//   // Add this in user.route.js:
//   app.get("/auth/success", (req, res) => {
//     const { token } = req.query;
//     res.send(`
//         <div style="font-family: sans-serif; text-align: center; padding: 50px;">
//             <h1 style="color: #16a34a;">🎉 Google Login Successful!</h1>
//             <p><strong>Your JWT Token:</strong></p>
//             <textarea style="width: 80%; height: 100px; padding: 10px;" readonly>${token}</textarea>
//         </div>
//     `);
//   });

//   app.get('/auth/failure', (req, res) => {
//     const { error } = req.query;
//     res.send(`
//         <div style="font-family: sans-serif; text-align: center; padding: 50px;">
//             <h1 style="color: #dc2626;">❌ Google Login Failed</h1>
//             <p>Error: ${error}</p>
//             <p>Please try again.</p>
//         </div>
//     `);
// });
// }

// module.exports = UserRoute;
