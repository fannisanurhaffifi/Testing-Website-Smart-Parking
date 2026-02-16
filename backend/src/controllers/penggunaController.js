const { query, pool } = require("../config/database");
const { sendOtpEmail } = require("../utils/lupapswd");
const { sendRegistrationPendingEmail } = require("../utils/email");
const bcrypt = require("bcryptjs");

/* =====================================================
   REGISTER PENGGUNA
===================================================== */
const registerPengguna = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { npm, nama, email, jurusan, prodi, password, plat_nomor } = req.body;
    const stnk = req.file ? req.file.filename : null;

    if (!npm || !nama || !email || !jurusan || !prodi || !password || !plat_nomor) {
      return res.status(400).json({
        status: "error",
        message: "Semua field wajib diisi",
      });
    }

    const [existing] = await connection.query(
      "SELECT npm FROM pengguna WHERE npm = ? OR email = ?",
      [npm, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "NPM atau email sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO pengguna
       (npm, nama, email, jurusan, prodi, password, status_akun, tanggal_daftar)
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
      [npm, nama, email, jurusan, prodi, hashedPassword]
    );

    await connection.query(
      `INSERT INTO kendaraan (npm, plat_nomor, stnk)
       VALUES (?, ?, ?)`,
      [npm, plat_nomor, stnk]
    );

    // ✅ LANGSUNG DAPAT KUOTA 30 SAAT DAFTAR
    await connection.query(
      "INSERT INTO kuota_parkir (npm, batas_parkir, jumlah_terpakai) VALUES (?, 30, 0)",
      [npm]
    );

    await connection.commit();

    // kirim email notifikasi (tidak menggagalkan registrasi jika error)
    sendRegistrationPendingEmail(email, nama);

    // 📡 Real-time update untuk Admin
    const io = req.app.get("io");
    if (io) io.emit("user_update", { action: "REGISTER", npm });

    return res.status(201).json({
      status: "success",
      message: "Registrasi berhasil, menunggu verifikasi admin",
    });
  } catch (error) {
    await connection.rollback();
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Gagal melakukan registrasi",
    });
  } finally {
    connection.release();
  }
};

/* =====================================================
   LOGIN
===================================================== */
const loginPengguna = async (req, res) => {
  try {
    const { npm, password } = req.body;

    if (!npm || !password) {
      return res.status(400).json({
        status: "error",
        message: "NPM dan password wajib diisi",
      });
    }

    const rows = await query(
      `SELECT npm, nama, email, jurusan, prodi, password, status_akun
       FROM pengguna WHERE npm = ? LIMIT 1`,
      [npm]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "NPM atau password salah",
      });
    }

    const user = rows[0];

    // Cek status_akun (1 = Aktif)
    if (user.status_akun !== 1) {
      let msg = "Akun belum diverifikasi admin";
      if (user.status_akun === 2) msg = "Akun Anda telah ditangguhkan/diblokir";

      return res.status(403).json({
        status: "error",
        message: msg,
      });
    }

    const match = await bcrypt.compare(password, user.password);


    if (!match) {
      return res.status(401).json({
        status: "error",
        message: "NPM atau password salah",
      });
    }

    // ✅ JARING PENGAMAN: PASTIKAN USER PUNYA KUOTA SAAT LOGIN
    const existingKuota = await query(
      "SELECT id_kuota FROM kuota_parkir WHERE npm = ? LIMIT 1",
      [user.npm]
    );

    if (existingKuota.length === 0) {
      await query(
        "INSERT INTO kuota_parkir (npm, batas_parkir, jumlah_terpakai) VALUES (?, 30, 0)",
        [user.npm]
      );
      console.log(`✅ Kuota awal 30 diberikan otomatis saat login untuk NPM ${user.npm}`);
    }

    return res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: {
        npm: user.npm,
        nama: user.nama,
        email: user.email,
        jurusan: user.jurusan,
        prodi: user.prodi,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR: ", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* =====================================================
   GET PROFIL
===================================================== */
const getProfilPengguna = async (req, res) => {
  try {
    const { npm } = req.params;

    const rows = await query(
      `SELECT p.npm, p.nama, p.email, p.jurusan, p.prodi, p.angkatan, p.foto, p.status_akun,
              k.id_kendaraan, k.plat_nomor, k.stnk,
              r.kode_rfid,
              COALESCE(
                (SELECT batas_parkir FROM kuota_parkir WHERE npm = p.npm ORDER BY id_kuota DESC LIMIT 1),
                (SELECT batas_parkir FROM kuota_parkir WHERE npm IS NULL ORDER BY id_kuota DESC LIMIT 1), 
                0
              ) - (
                SELECT COUNT(*) 
                FROM log_parkir l2 
                JOIN kendaraan k2 ON l2.id_kendaraan = k2.id_kendaraan 
                WHERE k2.npm = p.npm
              ) AS sisa_kuota
       FROM pengguna p
       LEFT JOIN kendaraan k ON p.npm = k.npm
       LEFT JOIN rfid r ON k.id_kendaraan = r.id_kendaraan
       WHERE p.npm = ?`,
      [npm]
    );


    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Profil tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error("GET PROFIL ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil profil",
    });
  }
};

/* =====================================================
   UPDATE PROFIL
===================================================== */
const editProfilPengguna = async (req, res) => {
  try {
    console.log("📥 UPDATE PROFIL REQUEST:", req.body);
    const { npm, jurusan, prodi, plat_nomor, angkatan } = req.body;

    // Ambil file jika ada (menggunakan upload.fields)
    const foto = req.files?.["foto"] ? req.files["foto"][0].filename : null;
    const stnk = req.files?.["stnk"] ? req.files["stnk"][0].filename : null;

    if (!npm) {
      return res.status(400).json({
        status: "error",
        message: "NPM wajib diisi",
      });
    }

    const trimmedNpm = npm.trim();

    // Update data di tabel pengguna
    if (foto) {
      await query(
        "UPDATE pengguna SET jurusan = ?, prodi = ?, angkatan = ?, foto = ? WHERE npm = ?",
        [jurusan, prodi, angkatan, foto, trimmedNpm]
      );
    } else {
      await query(
        "UPDATE pengguna SET jurusan = ?, prodi = ?, angkatan = ? WHERE npm = ?",
        [jurusan, prodi, angkatan, trimmedNpm]
      );
    }

    // Update data di tabel kendaraan
    // Hanya update jika plat_nomor dikirim atau stnk dikirim
    if (stnk && plat_nomor) {
      await query(
        "UPDATE kendaraan SET plat_nomor = ?, stnk = ? WHERE npm = ?",
        [plat_nomor, stnk, trimmedNpm]
      );
    } else if (stnk) {
      await query(
        "UPDATE kendaraan SET stnk = ? WHERE npm = ?",
        [stnk, trimmedNpm]
      );
    } else if (plat_nomor) {
      await query(
        "UPDATE kendaraan SET plat_nomor = ? WHERE npm = ?",
        [plat_nomor, trimmedNpm]
      );
    }

    console.log(`✅ Profil NPM ${trimmedNpm} berhasil diperbarui`);

    // 📡 Real-time update untuk Admin
    const io = req.app.get("io");
    if (io) io.emit("user_update", { action: "EDIT_PROFIL", npm: trimmedNpm });

    return res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
    });
  } catch (error) {
    console.error("🔥 UPDATE PROFIL ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal update profil",
    });
  }
};



/* =====================================================
   CHANGE PASSWORD (TANPA OTP - DARI HALAMAN PROFIL)
===================================================== */
const changePassword = async (req, res) => {
  try {
    const { npm, password_baru } = req.body;

    if (!npm || !password_baru) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak lengkap",
      });
    }

    const hashed = await bcrypt.hash(password_baru, 10);

    await query(
      "UPDATE pengguna SET password = ? WHERE npm = ?",
      [hashed, npm]
    );

    return res.status(200).json({
      status: "success",
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengubah password",
    });
  }
};

/* =====================================================
   RIWAYAT PARKIR
===================================================== */
const riwayatParkirPengguna = async (req, res) => {
  try {
    const { npm } = req.params;

    const rows = await query(
      `SELECT lp.id_log, k.plat_nomor,
              lp.waktu_masuk, lp.waktu_keluar, lp.status_parkir
       FROM log_parkir lp
       JOIN kendaraan k ON lp.id_kendaraan = k.id_kendaraan
       WHERE k.npm = ?
       ORDER BY lp.waktu_masuk DESC`,
      [npm]
    );

    return res.status(200).json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("RIWAYAT ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil riwayat parkir",
    });
  }
};

/* =====================================================
   LOGOUT
===================================================== */
const logoutPengguna = async (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Logout berhasil",
  });
};

/* =====================================================
   REQUEST OTP (LUPA PASSWORD)
===================================================== */
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await query(
      "SELECT email FROM pengguna WHERE email = ? LIMIT 1",
      [email]
    );

    if (user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Email tidak terdaftar",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await query("DELETE FROM reset_password_otp WHERE email = ?", [email]);

    await query(
      "INSERT INTO reset_password_otp (email, otp, expired_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))",
      [email, otp]
    );

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      status: "success",
      message: "OTP berhasil dikirim",
    });
  } catch (error) {
    console.error("REQUEST OTP ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengirim OTP",
    });
  }
};

/* =====================================================
   RESET PASSWORD DENGAN OTP
===================================================== */
const resetPasswordOtp = async (req, res) => {
  try {
    const { email, otp, password_baru } = req.body;

    const rows = await query(
      `SELECT * FROM reset_password_otp
       WHERE email = ? AND otp = ? AND expired_at > NOW()
       LIMIT 1`,
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "OTP tidak valid atau kadaluarsa",
      });
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);

    await query(
      "UPDATE pengguna SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    await query("DELETE FROM reset_password_otp WHERE email = ?", [email]);

    return res.status(200).json({
      status: "success",
      message: "Password berhasil direset",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal reset password",
    });
  }
};

/* =====================================================
   VERIFIKASI OTP
 ===================================================== */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const rows = await query(
      `SELECT * FROM reset_password_otp
       WHERE email = ? AND otp = ? AND expired_at > NOW()
       LIMIT 1`,
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "OTP tidak valid atau kadaluarsa",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "OTP valid",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal verifikasi OTP",
    });
  }
};

module.exports = {
  registerPengguna,
  loginPengguna,
  getProfilPengguna,
  editProfilPengguna,
  changePassword,
  riwayatParkirPengguna,
  logoutPengguna,
  requestOtp,
  verifyOtp,
  resetPasswordOtp,
};
