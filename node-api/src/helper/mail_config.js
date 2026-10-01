const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const path = require("path");
//config mail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

async function sendMail(req, res) {
    try {
        var { to, subject, text, html } = req.body;
        const mailOptions = {
            from: process.env.EMAIL, // sender
            to: to, // receiver
            subject: subject,
            text: text ,
            html: html,
            attachments: [
                {
                    filename: "Invoice.pdf",
                    path: path.join(__dirname, "../assets/invoice.pdf")
                }
            ]
        }

        const info = await transporter.sendMail(mailOptions);
        res.send({
            message: "Email sent successfully",
        })
    } catch (err) {
        console.error(err);
    }
}

module.exports = { sendMail };