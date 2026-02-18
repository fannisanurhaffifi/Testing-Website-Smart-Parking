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




const sendRegistrationSuccessEmail = async (toEmail, nama) => {
    try {
        if (!toEmail || toEmail.trim() === "") {
            throw new Error("Email penerima tidak valid atau kosong");
        }

        console.log("Mengirim email penegasan ke:", toEmail);

        const info = await transporter.sendMail({
            from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Pendaftaran Berhasil - Akun Aktif",
            html: `
        <h3>Halo ${nama},</h3>
        <p>Selamat! Pendaftaran Anda di sistem Smart Parking telah berhasil.</p>
        <p>Akun Anda kini sudah <strong>Aktif</strong> dan dapat langsung digunakan.</p>
        <p>Silakan login menggunakan email dan kata sandi yang telah Anda daftarkan.</p>
      `,
        });

        console.log("✅ Email sukses dikirim:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Gagal mengirim email sukses:", error.message);
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



module.exports = {
    sendRegistrationSuccessEmail,
    sendRegistrationPendingEmail,
};
