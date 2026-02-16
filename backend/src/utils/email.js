require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "",
    },
});

transporter.verify((error) => {
    if (error) {
        console.error("Email transporter error:", error);
    } else {
        console.log("Email transporter verifikasi ready");
    }
});

console.log("EMAIL:", process.env.EMAIL_USER);


const sendVerificationEmail = async (toEmail) => {
    try {
        // Validasi email
        if (!toEmail || toEmail.trim() === "") {
            throw new Error("Email penerima tidak valid atau kosong");
        }

        console.log("Mengirim email verifikasi ke:", toEmail);

        const info = await transporter.sendMail({
            from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Akun Anda Telah Diverifikasi",
            html: `
        <h3>Verifikasi Akun Berhasil</h3>
        <p>Akun Anda telah diverifikasi oleh admin.</p>
        <p>Silakan login ke sistem Smart Parking.</p>
      `,
        });

        console.log("✅ Email berhasil dikirim:", info.messageId);
        console.log("📧 Diterima oleh:", info.accepted);

        return info;
    } catch (error) {
        console.error("❌ Gagal mengirim email:", error.message);
        console.error("Detail error:", error);
        throw error;
    }
};

const sendRegistrationPendingEmail = async (toEmail, nama) => {
    try {
        if (!toEmail || toEmail.trim() === "") {
            throw new Error("Email penerima tidak valid atau kosong");
        }

        console.log("Mengirim email pendaftaran ke:", toEmail);

        const info = await transporter.sendMail({
            from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Pendaftaran Berhasil - Menunggu Verifikasi",
            html: `
        <h3>Halo ${nama},</h3>
        <p>Terima kasih telah mendaftar di sistem Smart Parking.</p>
        <p>Akun Anda sedang menunggu verifikasi dari admin. Mohon tunggu hingga akun Anda diaktifkan.</p>
        <p>Anda akan menerima email pemberitahuan setelah akun diverifikasi.</p>
      `,
        });

        console.log("✅ Email pendaftaran dikirim:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Gagal mengirim email pendaftaran:", error.message);
        // Jangan throw error agar registrasi tetap sukses walaupun email gagal
    }
};

const sendRejectionEmail = async (toEmail, nama, alasan = "Data tidak valid atau dokumen tidak lengkap.") => {
    try {
        if (!toEmail || toEmail.trim() === "") {
            throw new Error("Email penerima tidak valid atau kosong");
        }

        console.log("Mengirim email penolakan ke:", toEmail);

        const info = await transporter.sendMail({
            from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Pendaftaran Akun Ditolak",
            html: `
        <h3>Halo ${nama},</h3>
        <p>Mohon maaf, pendaftaran akun Anda di sistem Smart Parking telah <strong>Ditolak</strong>.</p>
        <p><strong>Alasan:</strong> ${alasan}</p>
        <p>Silakan hubungi admin atau lakukan pendaftaran ulang dengan data yang benar.</p>
      `,
        });

        console.log("✅ Email penolakan dikirim:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Gagal mengirim email penolakan:", error.message);
    }
};

module.exports = {
    sendVerificationEmail,
    sendRegistrationPendingEmail,
    sendRejectionEmail
};
