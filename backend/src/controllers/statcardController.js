const db = require("../config/database");

const getStatCardParkir = async (req, res) => {
  try {
    const { npm } = req.query;

    // ===== SLOT TERSEDIA (SISA SECARA FISIK) =====
    const slotRows = await db.query("SELECT SUM(jumlah) AS sisa FROM slot_parkir");
    const tersedia = parseInt(slotRows[0]?.sisa || 0);

    // ===== TERISI (KENDARAAN SEDANG PARKIR) =====
    const terisiRows = await db.query(`
      SELECT COUNT(*) AS total
      FROM log_parkir
      WHERE status_parkir = 'MASUK'
    `);
    const terisi = parseInt(terisiRows[0]?.total || 0);

    // ===== KESEMPATAN PARKIR (KUOTA MAHASISWA) =====
    let kesempatan_parkir = 0;

    if (npm) {
      const periode = new Date().toISOString().slice(0, 7); // YYYY-MM

      // 1. Ambil batas_parkir TERBARU untuk user ini (Bisa base quota atau update admin)
      const baseKuota = await db.query(`
        SELECT batas_parkir FROM kuota_parkir 
        WHERE npm = ? 
        ORDER BY id_kuota DESC LIMIT 1
      `, [npm]);

      const total_batas = parseInt(baseKuota[0]?.batas_parkir || 0);

      // 2. Ambil TOTAL jumlah_terpakai hanya untuk bulan ini
      const usageRows = await db.query(`
        SELECT COALESCE(SUM(jumlah_terpakai), 0) AS total_terpakai 
        FROM kuota_parkir 
        WHERE npm = ? AND periode_bulan = ?
      `, [npm, periode]);

      const total_terpakai = parseInt(usageRows[0]?.total_terpakai || 0);

      // Kesempatan = Batas terbaru - Pemakaian bulan ini
      kesempatan_parkir = Math.max(total_batas - total_terpakai, 0);
    } else {
      const globalKuota = await db.query(`
        SELECT batas_parkir FROM kuota_parkir 
        WHERE npm IS NULL 
        ORDER BY id_kuota DESC LIMIT 1
      `);
      kesempatan_parkir = parseInt(globalKuota[0]?.batas_parkir || 0);
    }

    console.log(`📊 StatCard request for NPM: ${npm || "Global"}`);
    console.log(`✅ Result: Terisi=${terisi}, Tersedia=${tersedia}, Kesempatan=${kesempatan_parkir}`);

    // ===== RESPONSE =====
    res.json({
      success: true,
      data: {
        terisi,
        tersedia,
        kesempatan_parkir,
      },
    });
  } catch (error) {
    console.error("StatCard Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data statcard",
    });
  }
};

module.exports = { getStatCardParkir };

