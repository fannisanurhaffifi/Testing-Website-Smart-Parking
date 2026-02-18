const nodemailer = require("nodemailer");
require("dotenv").config();

// 🔐 Transporter Brevo (Sendinblue) SMTP
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
    secure: false, // false untuk port 587 (STARTTLS)
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});

const FROM = `"${process.env.BREVO_FROM_NAME || "Smart Parking"}" <${process.env.BREVO_FROM_EMAIL}>`;

// ===================================================
// FUNGSI KIRIM OTP
// ===================================================
const sendOtpEmail = async (to, otp) => {
    try {
        const mailOptions = {
            from: FROM,
            to,
            subject: "Kode OTP Reset Password",
            html: `
        <h3>Reset Password Smart Parking</h3>
        <p>Kode OTP Anda adalah:</p>
        <h2 style="letter-spacing: 4px;">${otp}</h2>
        <p>Berlaku selama <strong>5 menit</strong>.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ OTP berhasil dikirim ke:", to);

    } catch (error) {
        console.error("❌ Gagal kirim OTP:", error.message);
        throw error;
    }
};

module.exports = { sendOtpEmail };
