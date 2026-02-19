require("dotenv").config();
const nodemailer = require("nodemailer");

// 🔐 Transporter Brevo (Sendinblue) SMTP
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.BREVO_SMTP_PORT) || 2525,
    secure: false, // false untuk port 2525/587 (STARTTLS)
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
    },
});

transporter.verify((error) => {
    if (error) {
        console.error("❌ Email transporter error:", error);
    } else {
        console.log("✅ Email transporter (Brevo) ready");
    }
});

const FROM = `"${process.env.BREVO_FROM_NAME || "Smart Parking"}" <${process.env.BREVO_FROM_EMAIL}>`;

const sendRegistrationSuccessEmail = async (toEmail, nama) => {
    try {
        if (!toEmail || toEmail.trim() === "") {
            throw new Error("Email penerima tidak valid atau kosong");
        }

        console.log("📧 Mengirim email konfirmasi ke:", toEmail);

        const info = await transporter.sendMail({
            from: FROM,
            to: toEmail,
            subject: "Pendaftaran Berhasil - Akun Aktif",
            html: `
        <h3>Halo ${nama},</h3>
        <p>Selamat! Pendaftaran Anda di sistem Smart Parking telah berhasil.</p>
        <p>Akun Anda kini sudah <strong>Aktif</strong> dan dapat langsung digunakan.</p>
        <p>Silakan login menggunakan NPM dan kata sandi yang telah Anda daftarkan.</p>
      `,
        });

        console.log("✅ Email sukses dikirim:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Gagal mengirim email sukses:", error.message);
        throw error;
    }
};

const sendRegistrationPendingEmail = async (toEmail, nama) => {
    try {
        if (!toEmail || toEmail.trim() === "") {
            throw new Error("Email penerima tidak valid atau kosong");
        }

        console.log("📧 Mengirim email pending ke:", toEmail);

        const info = await transporter.sendMail({
            from: FROM,
            to: toEmail,
            subject: "Pendaftaran Berhasil - Menunggu Verifikasi",
            html: `
        <h3>Halo ${nama},</h3>
        <p>Terima kasih telah mendaftar di sistem Smart Parking.</p>
        <p>Akun Anda sedang menunggu verifikasi dari admin. Mohon tunggu hingga akun Anda diaktifkan.</p>
        <p>Anda akan menerima email pemberitahuan setelah akun diverifikasi.</p>
      `,
        });

        console.log("✅ Email pending dikirim:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Gagal mengirim email pending:", error.message);
    }
};

const sendOtpEmail = async (to, otp) => {
    try {
        if (!to || to.trim() === "") {
            throw new Error("Email penerima tidak valid atau kosong");
        }

        console.log("📧 Mengirim OTP ke:", to);

        const info = await transporter.sendMail({
            from: FROM,
            to: to,
            subject: "Kode OTP Reset Password",
            html: `
        <h3>Reset Password Smart Parking</h3>
        <p>Kode OTP Anda adalah:</p>
        <h2 style="letter-spacing: 4px;">${otp}</h2>
        <p>Berlaku selama <strong>5 menit</strong>.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      `,
        });

        console.log("✅ OTP berhasil dikirim ke:", to);
        return info;
    } catch (error) {
        console.error("❌ Gagal kirim OTP:", error.message);
        throw error;
    }
};

module.exports = {
    sendRegistrationSuccessEmail,
    sendRegistrationPendingEmail,
    sendOtpEmail,
};
