const { query } = require("../config/database");
const PDFDocument = require("pdfkit");
const { sendVerificationEmail, sendRejectionEmail } = require("../utils/email");

/* =====================================================
   LOGIN ADMIN
===================================================== */
const loginAdmin = async (req, res) => {
  try {
    const { nama, password } = req.body;

    if (!nama || !password) {
      return res.status(400).json({
        status: "error",
        message: "Nama dan password wajib diisi",
      });
    }

    const rows = await query(
      "SELECT id_admin, nama, password FROM admin WHERE nama = ? LIMIT 1",
      [nama]
    );

    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({
        status: "error",
        message: "Nama atau password salah",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Login admin berhasil",
      data: {
        id_admin: rows[0].id_admin,
        nama: rows[0].nama,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("loginAdmin:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

/* =====================================================
   VERIFIKASI PENGGUNA + KIRIM EMAIL
===================================================== */
const verifikasiPengguna = async (req, res) => {
  try {
    const { npm, status_akun } = req.body;

    if (!npm) {
      return res.status(400).json({
        status: "error",
        message: "NPM wajib diisi",
      });
    }

    const user = await query(
      "SELECT email, nama, status_akun FROM pengguna WHERE npm = ?",
      [npm]
    );

    if (user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Pengguna tidak ditemukan",
      });
    }

    await query(
      "UPDATE pengguna SET status_akun = ? WHERE npm = ?",
      [status_akun ?? 1, npm]
    );

    // Kirim email verifikasi jika diaktifkan (status_akun === 1)
    if (status_akun === 1) {
      // ✅ JARING PENGAMAN: PASTIKAN USER PUNYA KUOTA (Jika belum ada)
      const existingKuota = await query(
        "SELECT id_kuota FROM kuota_parkir WHERE npm = ? LIMIT 1",
        [npm]
      );

      if (existingKuota.length === 0) {
        await query(
          "INSERT INTO kuota_parkir (npm, batas_parkir, jumlah_terpakai) VALUES (?, 30, 0)",
          [npm]
        );
        console.log(`✅ Kuota awal 30 diberikan untuk NPM ${npm}`);
      }

      try {
        await sendVerificationEmail(user[0].email);
      } catch (emailErr) {
        console.error("Email gagal:", emailErr.message);
      }
    }

    // Kirim email penolakan jika ditolak (status_akun === 3)
    if (status_akun === 3) {
      try {
        await sendRejectionEmail(user[0].email, user[0].nama || "Mahasiswa");
      } catch (emailErr) {
        console.error("Email penolakan gagal:", emailErr.message);
      }
    }

    let successMessage = "Status akun diperbarui";
    if (status_akun === 1) successMessage = "Akun berhasil diverifikasi";
    if (status_akun === 3) successMessage = "Pendaftaran berhasil ditolak";

    // 📡 Real-time update untuk Admin
    const io = req.app.get("io");
    if (io) io.emit("user_update", { action: "VERIFY", npm, status: status_akun });

    return res.status(200).json({
      status: "success",
      message: successMessage,
    });

  } catch (err) {
    console.error("verifikasiPengguna:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};


/* =====================================================
   LIST DATA PENGGUNA
===================================================== */
const getDataPengguna = async (req, res) => {
  try {
    const { search, limit, offset, status } = req.query;
    const safeLimit = parseInt(limit) || 10;
    const safeOffset = parseInt(offset) || 0;

    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push("(p.nama LIKE ? OR p.npm LIKE ? OR k.plat_nomor LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClauses.push("p.status_akun = ?");
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 1️⃣ Hitung total (untuk pagination)
    const [countResult] = await query(`
      SELECT COUNT(*) as total
      FROM pengguna p
      LEFT JOIN kendaraan k ON p.npm = k.npm
      ${whereSql}
    `, params);

    const totalData = countResult ? countResult.total : 0;

    // 2️⃣ Ambil data paginasi
    const rows = await query(`
      SELECT 
        p.npm,
        p.nama,
        p.email,
        p.jurusan,
        p.prodi,
        p.status_akun,
        k.plat_nomor,
        k.stnk,
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
      ${whereSql}
      ORDER BY p.nama ASC
      LIMIT ? OFFSET ?
    `, [...params, safeLimit, safeOffset]);

    return res.status(200).json({
      status: "success",
      data: rows,
      total: totalData,
    });
  } catch (err) {
    console.error("getDataPengguna:", err);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data pengguna",
    });
  }
};

/* =====================================================
   HAPUS PENGGUNA
===================================================== */
/* =====================================================
   HAPUS PENGGUNA (CASCADE MANUAL)
===================================================== */
const hapusPengguna = async (req, res) => {
  try {
    const { npm } = req.params;

    if (!npm) {
      return res.status(400).json({
        status: "error",
        message: "NPM wajib diisi",
      });
    }

    // 1. Hapus Log Parkir (Linked to Kendaraan)
    await query(
      "DELETE FROM log_parkir WHERE id_kendaraan IN (SELECT id_kendaraan FROM kendaraan WHERE npm = ?)",
      [npm]
    );

    // 2. Hapus RFID (Linked to Kendaraan)
    await query(
      "DELETE FROM rfid WHERE id_kendaraan IN (SELECT id_kendaraan FROM kendaraan WHERE npm = ?)",
      [npm]
    );

    // 3. Hapus Kendaraan
    await query("DELETE FROM kendaraan WHERE npm = ?", [npm]);

    // 4. Hapus Kuota Parkir Khusus
    await query("DELETE FROM kuota_parkir WHERE npm = ?", [npm]);

    // 5. Akhirnya Hapus Pengguna
    const result = await query("DELETE FROM pengguna WHERE npm = ?", [npm]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Pengguna tidak ditemukan",
      });
    }

    // 📡 Real-time update untuk Admin
    const io = req.app.get("io");
    if (io) io.emit("user_update", { action: "DELETE", npm });

    return res.status(200).json({
      status: "success",
      message: "Pengguna dan data terkait berhasil dihapus",
    });

  } catch (err) {
    console.error("hapusPengguna:", err);
    return res.status(500).json({
      status: "error",
      message: "Gagal menghapus pengguna",
    });
  }
};

/* =====================================================
   GENERATE RFID - FINAL VERSION (CLEAN & PRODUCTION READY)
===================================================== */
const generateRFID = async (req, res) => {
  try {
    console.log("📥 generateRFID BODY:", req.body);

    if (!req.body) {
      return res.status(400).json({
        status: "error",
        message: "Request body tidak ditemukan atau kosong"
      });
    }

    const { id_kendaraan, kode_rfid, id_admin } = req.body;

    /* =================================================
       BERSIHKAN SESSION EXPIRED (AUTO CLEANUP)
    ================================================= */
    await query("DELETE FROM rfid_registration_session WHERE expired_at < NOW()");

    /* =================================================
       MODE 1: MANAJEMEN MANUAL (Admin isi langsung)
    ================================================= */
    if (id_kendaraan && kode_rfid) {

      const existing = await query(
        "SELECT id_kendaraan FROM rfid WHERE kode_rfid = ? AND id_kendaraan != ?",
        [kode_rfid, id_kendaraan]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "RFID sudah digunakan kendaraan lain"
        });
      }

      const current = await query(
        "SELECT id_rfid FROM rfid WHERE id_kendaraan = ?",
        [id_kendaraan]
      );

      if (current.length > 0) {
        await query(
          "UPDATE rfid SET kode_rfid = ?, tanggal_aktif = NOW() WHERE id_kendaraan = ?",
          [kode_rfid, id_kendaraan]
        );
      } else {
        await query(
          "INSERT INTO rfid (id_kendaraan, kode_rfid, status_rfid, tanggal_aktif) VALUES (?, ?, 1, NOW())",
          [id_kendaraan, kode_rfid]
        );
      }

      return res.json({
        status: "success",
        message: "RFID berhasil diperbarui secara manual"
      });
    }

    /* =================================================
       MODE 2: ADMIN MULAI SESI (Buka window 60 detik)
    ================================================= */
    if (id_kendaraan && id_admin && !kode_rfid) {

      const kendaraan = await query(
        "SELECT id_kendaraan FROM kendaraan WHERE id_kendaraan = ?",
        [id_kendaraan]
      );

      if (kendaraan.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Kendaraan tidak ditemukan"
        });
      }

      // Hapus semua session PENDING agar tidak bentrok
      await query("DELETE FROM rfid_registration_session WHERE status = 'PENDING'");

      await query(`
        INSERT INTO rfid_registration_session
        (id_kendaraan, id_admin, status, expired_at)
        VALUES (?, ?, 'PENDING', DATE_ADD(NOW(), INTERVAL 60 SECOND))
      `, [id_kendaraan, id_admin]);

      return res.json({
        status: "success",
        message: "Mode scan otomatis aktif. Silakan scan kartu dalam 60 detik."
      });
    }

    /* =================================================
       MODE 3: ALAT KIRIM SCAN
    ================================================= */
    if (kode_rfid && !id_kendaraan) {

      const session = await query(`
        SELECT * FROM rfid_registration_session
        WHERE status = 'PENDING' AND expired_at > NOW()
        ORDER BY id_session DESC
        LIMIT 1
      `);

      if (session.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Tidak ada sesi scan aktif"
        });
      }

      const { id_kendaraan: targetId, id_session } = session[0];

      const current = await query(
        "SELECT id_rfid FROM rfid WHERE id_kendaraan = ?",
        [targetId]
      );

      if (current.length > 0) {
        await query(
          "UPDATE rfid SET kode_rfid = ?, tanggal_aktif = NOW() WHERE id_kendaraan = ?",
          [kode_rfid, targetId]
        );
      } else {
        await query(
          "INSERT INTO rfid (id_kendaraan, kode_rfid, status_rfid, tanggal_aktif) VALUES (?, ?, 1, NOW())",
          [targetId, kode_rfid]
        );
      }

      /* ===============================================
         HAPUS SESSION SETELAH SUKSES (CLEAN DATABASE)
      =============================================== */
      await query(
        "DELETE FROM rfid_registration_session WHERE id_session = ?",
        [id_session]
      );

      // Emit ke dashboard realtime
      const io = req.app.get("io");
      io.emit("rfid_scanned", {
        status: "success",
        kode_rfid,
        id_kendaraan: targetId
      });

      return res.json({
        status: "success",
        message: "RFID berhasil didaftarkan otomatis via alat",
        data: { kode_rfid }
      });
    }

    return res.status(400).json({
      status: "error",
      message: "Request tidak valid"
    });

  } catch (err) {
    console.error("🔥 generateRFID Error:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      details: err.message
    });
  }
};

/* =====================================================
   DASHBOARD SUMMARY
===================================================== */
const dashboardSummary = async (req, res) => {
  try {
    const [slotResults, terisiResults, aktifResults, kuotaResults] = await Promise.all([
      query("SELECT COALESCE(SUM(jumlah),0) AS total FROM slot_parkir"),
      query("SELECT COUNT(*) AS total FROM log_parkir WHERE status_parkir='MASUK'"),
      query("SELECT COUNT(*) AS total FROM pengguna WHERE status_akun=1"),
      query("SELECT batas_parkir FROM kuota_parkir WHERE npm IS NULL ORDER BY id_kuota DESC LIMIT 1"),
    ]);

    const total_slot = slotResults[0]?.total || 0;
    const terisi = terisiResults[0]?.total || 0;
    const pengguna_aktif = aktifResults[0]?.total || 0;
    const kuota_global = kuotaResults[0]?.batas_parkir || 0;

    return res.status(200).json({
      status: "success",
      data: {
        total_slot,
        terisi,
        tersedia: Math.max(total_slot - terisi, 0),
        pengguna_aktif,
        kuota_global,
      },
    });

  } catch (err) {
    console.error("🔥 dashboardSummary ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

/* =====================================================
   LIST DATA PARKIR
===================================================== */
const getDataParkir = async (req, res) => {
  try {
    const { search, start, end, limit, offset } = req.query;
    const safeLimit = parseInt(limit) || 30;
    const safeOffset = parseInt(offset) || 0;

    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push("(p.nama LIKE ? OR k.plat_nomor LIKE ? OR p.npm LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (start && start !== "") {
      whereClauses.push("l.waktu_masuk >= ?");
      params.push(`${start} 00:00:00`);
    }

    if (end && end !== "") {
      whereClauses.push("l.waktu_masuk <= ?");
      params.push(`${end} 23:59:59`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 1️⃣ HITUNG TOTAL DATA (UNTUK PAGINATION)
    const [countResult] = await query(`
      SELECT COUNT(*) as total
      FROM log_parkir l
      LEFT JOIN kendaraan k ON l.id_kendaraan = k.id_kendaraan
      LEFT JOIN pengguna p ON k.npm = p.npm
      ${whereSql}
    `, params);

    const totalData = countResult ? countResult.total : 0;

    // 2️⃣ AMBIL DATA HALAMAN INI
    const rows = await query(`
      SELECT 
        p.npm,
        p.nama,
        k.plat_nomor,
        l.waktu_masuk,
        l.waktu_keluar,
        l.status_parkir
      FROM log_parkir l
      LEFT JOIN kendaraan k ON l.id_kendaraan = k.id_kendaraan
      LEFT JOIN pengguna p ON k.npm = p.npm
      ${whereSql}
      ORDER BY l.waktu_masuk DESC
      LIMIT ? OFFSET ?
    `, [...params, safeLimit, safeOffset]);

    const formattedData = rows.map(r => {
      const masukDate = r.waktu_masuk ? new Date(r.waktu_masuk) : null;
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      return {
        npm: r.npm || "-",
        nama: r.nama || "Tanpa Identitas",
        plat_motor: r.plat_nomor || "-",
        tanggal: (masukDate && !isNaN(masukDate.getTime())) ? masukDate.toLocaleDateString("id-ID") : "-",
        hari: (masukDate && !isNaN(masukDate.getTime())) ? days[masukDate.getDay()] : "-",
        masuk: (masukDate && !isNaN(masukDate.getTime())) ? masukDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-",
        keluar: r.waktu_keluar && !isNaN(new Date(r.waktu_keluar).getTime())
          ? new Date(r.waktu_keluar).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
          : "-",
        status: r.status_parkir === "MASUK" ? "Terparkir" : "Keluar"
      };
    });

    return res.status(200).json({
      status: "success",
      data: formattedData,
      total: totalData,
    });
  } catch (err) {
    console.error("getDataParkir:", err);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data parkir",
    });
  }
};


/* =====================================================
   EXPORT PDF PARKIR
===================================================== */
const exportParkirPDF = async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        p.nama,
        k.plat_nomor,
        l.waktu_masuk,
        l.waktu_keluar,
        l.status_parkir
      FROM log_parkir l
      LEFT JOIN kendaraan k ON l.id_kendaraan = k.id_kendaraan
      LEFT JOIN pengguna p ON k.npm = p.npm
      ORDER BY l.waktu_masuk DESC
    `);

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=laporan-parkir.pdf"
    );

    doc.pipe(res);

    doc.fontSize(16).text("LAPORAN DATA PARKIR", { align: "center" });
    doc.moveDown();

    rows.forEach((r, i) => {
      doc.fontSize(10).text(
        `${i + 1}. ${r.nama} | ${r.plat_nomor} | ${r.waktu_masuk} - ${r.waktu_keluar || "-"
        } | ${r.status_parkir}`
      );
    });

    doc.end();

  } catch (err) {
    console.error("exportParkirPDF:", err);
    return res.status(500).json({
      status: "error",
      message: "Gagal export PDF",
    });
  }
};

/* =====================================================
   UPDATE KUOTA PARKIR (INDIVIDUAL / GLOBAL)
===================================================== */
const updateKuotaParkir = async (req, res) => {
  try {
    const { batas_parkir, npm } = req.body;
    console.log("➡️ UPDATE KUOTA:", { npm, batas_parkir });

    if (batas_parkir === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Batas parkir wajib diisi",
      });
    }

    // Insert as new record (history logic remains)
    // Jika npm ada, maka ini kuota individu. Jika NULL, maka kuota global.
    await query(
      "INSERT INTO kuota_parkir (batas_parkir, npm) VALUES (?, ?)",
      [batas_parkir, npm || null]
    );

    const io = req.app.get("io");
    if (io) {
      io.emit("user_update", { action: "KUOTA_UPDATE", npm });
    }

    return res.status(200).json({
      status: "success",
      message: npm
        ? `Kuota parkir untuk NPM ${npm} berhasil diperbarui`
        : "Kuota parkir global berhasil diperbarui",
    });
  } catch (err) {
    console.error("updateKuotaParkir:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

/* =====================================================
   UPDATE SLOT PARKIR (TOTAL)
===================================================== */
const updateSlotParkir = async (req, res) => {
  try {
    const { jumlah, id_admin } = req.body;

    if (jumlah === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Jumlah slot wajib diisi",
      });
    }

    // Cek apakah sudah ada baris di slot_parkir
    const rows = await query("SELECT id_slot FROM slot_parkir LIMIT 1");

    if (rows.length > 0) {
      // UPDATE
      await query(
        "UPDATE slot_parkir SET jumlah = ?, id_admin = ? WHERE id_slot = ?",
        [jumlah, id_admin || null, rows[0].id_slot]
      );
    } else {
      // INSERT
      await query(
        "INSERT INTO slot_parkir (jumlah, id_admin) VALUES (?, ?)",
        [jumlah, id_admin || null]
      );
    }

    const io = req.app.get("io");
    io.emit("parking_update", { action: "SLOT_UPDATE" });

    return res.status(200).json({
      status: "success",
      message: "Jumlah slot parkir berhasil diperbarui",
    });
  } catch (err) {
    console.error("updateSlotParkir:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

module.exports = {
  loginAdmin,
  verifikasiPengguna,
  getDataPengguna,
  hapusPengguna,
  generateRFID,
  dashboardSummary,
  getDataParkir,
  exportParkirPDF,
  updateKuotaParkir,
  updateSlotParkir,
};

