require("dotenv").config();

// 🔍 Debug: Pastikan API Key terbaca
console.log("📧 Menggunakan Brevo API Mode...");
const BREVO_API_KEY = process.env.BREVO_PASS ? process.env.BREVO_PASS.trim() : null;
console.log("- API Key:", BREVO_API_KEY ? "✅ Terisi (Sudah di-trim)" : "❌ Kosong");

/**
 * Fungsi Inti Kirim Email via Brevo API (HTTP)
 * Lebih stabil di hosting cloud karena tidak pakai port SMTP yang sering diblokir.
 */
const sendEmailViaAPI = async (payload) => {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_FROM_NAME || "Smart Parking",
                    email: process.env.BREVO_FROM_EMAIL || "fannisanurhaffifi@gmail.com"
                },
                to: [{ email: payload.toEmail }],
                subject: payload.subject,
                htmlContent: payload.htmlContent
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Brevo API Error:", result);
            throw new Error(result.message || "Gagal mengirim email via API");
        }

        console.log("✅ Email sukses terkirim via API!");
        return result;
    } catch (error) {
        console.error("🔥 Error di sendEmailViaAPI:", error.message);
        throw error;
    }
};

const sendRegistrationSuccessEmail = async (toEmail, nama) => {
    return sendEmailViaAPI({
        toEmail,
        subject: "Pendaftaran Berhasil - Akun Aktif",
        htmlContent: `
            <h3>Halo ${nama},</h3>
            <p>Selamat! Pendaftaran Anda di sistem Smart Parking telah berhasil.</p>
            <p>Akun Anda kini sudah <strong>Aktif</strong> dan dapat langsung digunakan.</p>
            <p>Silakan login menggunakan NPM dan kata sandi yang telah Anda daftarkan.</p>
        `
    }).catch(e => console.error("Email Success Error:", e.message));
};

const sendRegistrationPendingEmail = async (toEmail, nama) => {
    return sendEmailViaAPI({
        toEmail,
        subject: "Pendaftaran Berhasil - Menunggu Verifikasi",
        htmlContent: `
            <h3>Halo ${nama},</h3>
            <p>Terima kasih telah mendaftar di sistem Smart Parking.</p>
            <p>Akun Anda sedang menunggu verifikasi dari admin. Mohon tunggu hingga akun Anda diaktifkan.</p>
            <p>Anda akan menerima email pemberitahuan setelah akun diverifikasi.</p>
        `
    }).catch(e => console.error("Email Pending Error:", e.message));
};

const sendOtpEmail = async (toEmail, otp) => {
    return sendEmailViaAPI({
        toEmail,
        subject: "Kode OTP Reset Password",
        htmlContent: `
            <h3>Reset Password Smart Parking</h3>
            <p>Kode OTP Anda adalah:</p>
            <h2 style="letter-spacing: 4px;">${otp}</h2>
            <p>Berlaku selama <strong>5 menit</strong>.</p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        `
    });
};

const sendAccountStatusEmail = async (toEmail, nama, status) => {
    let subject = "Pembaruan Status Akun Smart Parking";
    let message = "";

    if (status === 1) {
        subject = "Akun Smart Parking Anda Telah Diaktifkan";
        message = "Selamat! Akun Anda telah diverifikasi oleh admin. Sekarang Anda sudah dapat menggunakan fasilitas parkir.";
    } else if (status === 2) {
        subject = "Akun Smart Parking Ditangguhkan";
        message = "Mohon maaf, hak parkir akun Anda telah ditangguhkan sementara oleh admin. Silakan hubungi bagian teknis jika ini adalah kesalahan.";
    } else {
        return; // Tidak kirim email jika status tidak dikenal
    }

    return sendEmailViaAPI({
        toEmail,
        subject,
        htmlContent: `
            <h3>Halo ${nama},</h3>
            <p>${message}</p>
            <p>Terima kasih,<br>Tim Smart Parking</p>
        `
    }).catch(e => console.error("Email Status Update Error:", e.message));
};

module.exports = {
    sendRegistrationSuccessEmail,
    sendRegistrationPendingEmail,
    sendOtpEmail,
    sendAccountStatusEmail,
};
