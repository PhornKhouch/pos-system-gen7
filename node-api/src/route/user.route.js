const {
  getuser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  /*
  SendOTP,
  verify_Otp,
  setNewPassword,
  GetUserV2,
  */
} = require("../controller/user.controller");
const { uploadUserProfile } = require("../helper/upload");
// const { validate_token } = require("../middleware/auth");

/*
const {
  initiateGoogleAuth,
  handleGoogleCallback,
  verifyGoogleCredential,
} = require("../controller/auth.controller.js");
*/

function UserRoute(app) {
  // User CRUD routes
  app.get("/api/v1/user/getall", getuser);
  app.get("/api/v1/user/getone/:id", getUserById);
  app.post("/api/v1/user/create", uploadUserProfile.single("image"), createUser);
  app.put("/api/v1/user/update/:id", uploadUserProfile.single("image"), updateUser);
  app.delete("/api/v1/user/delete/:id", deleteUser);

  // Authentication routes
  app.post("/api/v1/user/login", login);

  /*
  // Send OTP to email
  app.post("/api/v1/user/send-otp", SendOTP);

  // Verify OTP
  app.post("/api/v1/user/verify-otp", verify_Otp);

  // Set new password
  app.post("/api/v1/user/set-new-password", setNewPassword);

  // Testing user route with sequelize
  app.get("/api/v2/user/getAll", GetUserV2);

  // Google Auth 2.0
  app.get("/api/v1/auth/google", initiateGoogleAuth);
  app.get("/api/v1/auth/google/callback", handleGoogleCallback);
  // app.post("/api/v1/auth/google/verify", verifyGoogleCredential);

  app.get("/auth/success", (req, res) => {
    const { token } = req.query;
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #16a34a;">🎉 Google Login Successful!</h1>
            <p><strong>Your JWT Token:</strong></p>
            <textarea style="width: 80%; height: 100px; padding: 10px;" readonly>${token}</textarea>
        </div>
    `);
  });

  app.get("/auth/failure", (req, res) => {
    const { error } = req.query;
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">❌ Google Login Failed</h1>
            <p>Error: ${error}</p>
            <p>Please try again.</p>
        </div>
    `);
  });
  */
}

module.exports = UserRoute;
