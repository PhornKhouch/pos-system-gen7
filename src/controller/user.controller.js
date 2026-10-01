// const db = require('../config/config');
// const { IsEmpty } = require('../helper/validate');
// var bcrypt = require('bcrypt');
// var jwt = require('jsonwebtoken');
// var dotenv = require('dotenv');
// var nodemailer = require("nodemailer");
// var sequelize = require('../config/sequelizeConfig');

// const User = require('../models/User');

// dotenv.config(); // Load environment variables from .env file

// const mailer = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.APP_PASSWORD,
//     },
// });

// var SECRET_KEY = process.env.SECRET_KEY; // Get the secret key from environment variables

// const getuser = async (req, res) => {
//     try {
//         var sql = `
//         SELECT * from tbl_user  
//     `;

//         const [result] = await db.query(sql);
//         res.send({
//             user: result
//         });
//     }
//     catch (error) {
//         res.send({
//             message: error
//         })
//     }
// }


// const createUser = async (req, res) => {
//     try{
//         var saltRounds = 10;
//         var {userid,email , password , status} = req.body;
//        // hash password 
//        password = bcrypt.hashSync(password, saltRounds);
    
//         if(IsEmpty(userid)){
//             res.send({
//                 message: "userid is required"
//             })
//         }
//         if(IsEmpty(email)){
//             res.send({
//                 message: "email is required"
//             })
//         }
//         if(IsEmpty(password)){
//             res.send({
//                 message: "password is required"
//             })
//         }
//         //if user_id already exist
//         var select = `select * from tbl_user where user_id = '${userid}'`;
//         var [result] = await db.query(select);
//         if(result.length > 0){
//             res.send({
//                 message: "user already exist"
//             })
//             return;
//         }

//         //validate email already exist
//         var select = `select * from tbl_user where email = '${email}'`;
//         var [result] = await db.query(select);
//         if(result.length > 0){
//             res.send({
//                 message: "email already exist! choose another email"
//             })
//             return;
//         }

//         //new record insert
//         var sql = `
//             INSERT INTO tbl_user (user_id, email, password, status)
//             VALUES ('${userid}', '${email}', '${password}', '${status}')
//         `;

//         //execute query
//         await db.query(sql);
//         res.send({
//             message: "data inserted successfully"
//         });
//     }
//     catch(error){
//         res.send({
//             message: error
//         })
//     }
// }

// const otpStore = {};
// //login user
// const login = async (req, res) => {
//     try{
//        var {email , password} = req.body;
//        if(IsEmpty(email)){
//            res.send({
//                message: "email is required"
//            })
//        }
//        if(IsEmpty(password)){
//            res.send({
//                message: "password is required"
//            })
//        }

//        //select email of user from tbl_user
//        var select = `select * from tbl_user where email = '${email}'`;
//        var [result] = await db.query(select);
//        if(result.length == 0){
//            res.send({
//                message: "email not found"
//            })
//            return;
//        }
//        else{
//            //check password
//            var dbpassword = result[0].password; 
//            var isMatchPassword = bcrypt.compareSync(password, dbpassword); // return true | false
//            if(isMatchPassword){
//              //generate token
//               var token = jwt.sign({ email: email }, SECRET_KEY, { expiresIn: '1h' });
//               res.send({
//                   message: "login successfully",
//                   token: token
//               })
//            }
//            else{
//                res.send({
//                    message: "Incorrect password"
//                })
//            }
//        }
//     }
//     catch(error){
//         res.send({
//             message: error
//         })
//     }
// }

// const SendOTP = async (req , res) => {
    
//     try{
//         var {email} = req.body;
//         if(IsEmpty(email)){
//             res.send({
//                 message: "email is required"
//             })
//             return;
//         }
//         // Check if email exists in database
//         var SQL = `SELECT * FROM tbl_user WHERE email='${email}'`;
//         var [result] = await db.query(SQL);
        
//         if(result.length === 0) {
//             return res.json({
//                 message: "Email not found",
//                 success: false
//             });
//         }
        
//         // Generate 6-digit OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
//         // Store OTP with email (expires in 10 minutes)
//         otpStore[email] = {
//             otp: otp,
//             expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
//         };
        
//         // Send OTP via email
//         const mailOptions = {
//             from: 'pkhouch97@gmail.com',
//             to: email,
//             subject: 'Password Reset OTP',
//             html: `
//                 <h2>Password Reset Request</h2>
//                 <p>Your OTP code is:</p>
//                 <h3 style="color: #007bff; font-size: 24px; letter-spacing: 2px;">${otp}</h3>
//                 <p>This OTP is valid for 10 minutes.</p>
//                 <p>If you didn't request this, please ignore this email.</p>
//                 <hr>
//                 <p style="color:gray;font-size:12px;">
//                     © 2025 Your Company
//                 </p>
//             `
//         };
        
//         await mailer.sendMail(mailOptions, function(error, info){
//             if (error) {
//                 res.json({
//                     message:error.message,
//                     success: false
//                 });
//             } else {
//                 res.json({
//                     message: "OTP sent to your email successfully",
//                     success: true
//                 });
//             }
//         });
//     }
//     catch(err){
//         console.log(err);
//     }
// }


// const verify_Otp = async (req , res) => {
//     try{
//         var {email, otp} = req.body;
        
//         // Check if OTP exists and is not expired
//         if(!otpStore[email]) {
//             return res.json({
//                 message: "OTP not found or expired",
//                 success: false
//             });
//         }
        

//         // Check if OTP time is not expired
//         if(otpStore[email].expiresAt < Date.now()) {  // 9 : 00 < 9. : 10  
//             delete otpStore[email];
//             return res.json({
//                 message: "OTP has expired",
//                 success: false
//             });
//         }
        
//         //check otp invalid 
//         if(otpStore[email].otp !== otp) { // 123456 = 123
//             return res.json({
//                 message: "Invalid OTP",
//                 success: false
//             });
//         }
        
//         res.json({
//             message: "OTP verified successfully",
//             success: true
//         });
//     }
//     catch(err){
//         console.log(err);
//     }
// }


// const setNewPassword = async (req , res) => {
//     try{
//         var {email, otp, newPassword} = req.body;
        
//         // Verify OTP
//         if(!otpStore[email] || otpStore[email].otp !== otp) {
//             return res.json({
//                 message: "Invalid OTP",
//                 success: false
//             });
//         }
        
//         // Hash new password
//         var hashedPassword = await bcrypt.hash(newPassword, 10);
        
//         // Update password in database
//         let SQL = `UPDATE tbl_user SET password='${hashedPassword}' WHERE email='${email}'`;
//         await db.query(SQL);
        
//         // Clear OTP
//         delete otpStore[email];
        
//         res.json({
//             message: "Password reset successfully",
//             success: true
//         });
//     }
//     catch(err){
//        console.log(err);
//     }
// }

// //v2 Get user 
// const GetUserV2 = async (req, res) => {
//    try{
//        // const users = await User.findAll(); // select * from tbl_user
//        var [result] = await db.query("select * from tbl_user");
//        res.send({
//            users: result
//        });  
//    }
//    catch(err){
//        console.log(err);
//    }
// }

// module.exports = { getuser,createUser , login  ,SendOTP , verify_Otp ,setNewPassword, GetUserV2};