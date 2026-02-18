const { query } = require("../config/database");





const parkirManual = async (req, res) => {
  try {
    const { npm, aksi } = req.body;
    console.log(`📡 MANUAL ACTION: NPM=${npm}, Action=${aksi}`);

    if (!npm || !aksi) {
      return res.status(400).json({ status: "error", message: "NPM dan aksi wajib diisi" });
    }

    if (!["MASUK", "KELUAR"].includes(aksi)) {
      return res.status(400).json({ status: "error", message: "Aksi tidak valid" });
    }

    // 1️⃣ Cari kendaraan berdasarkan NPM
    const rows = await query(
      "SELECT id_kendaraan, npm FROM kendaraan WHERE npm = ? LIMIT 1",
      [npm]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Kendaraan tidak ditemukan" });
    }

    const { id_kendaraan } = rows[0];

    // 2️⃣ Cek apakah sedang parkir (untuk Keluar) atau tidak (untuk Masuk)
    const logAktif = await query(
      `SELECT id_log FROM log_parkir 
       WHERE id_kendaraan = ? AND status_parkir = 'MASUK' AND waktu_keluar IS NULL 
       LIMIT 1`,
      [id_kendaraan]
    );

    const periode = new Date().toISOString().slice(0, 7);

    if (aksi === "KELUAR") {
      if (logAktif.length === 0) {
        return res.status(400).json({ status: "error", message: "Kendaraan tidak terdeteksi sedang parkir" });
      }

      await query(
        "UPDATE log_parkir SET waktu_keluar = NOW(), status_parkir = 'KELUAR' WHERE id_log = ?",
        [logAktif[0].id_log]
      );

      // Slot update removed, using dynamic calculation (kapasitas - terisi)

      const io = req.app.get("io");
      if (io) io.emit("parking_update", { action: "KELUAR_MANUAL", npm });

      return res.json({ status: "success", message: "Berhasil keluar (Manual)", servo: 2 });
    }

    // MODE MASUK
    if (logAktif.length > 0) {
      return res.status(400).json({ status: "error", message: "Kendaraan sudah berada di dalam" });
    }

    // Cek kapasitas
    const [slotData] = await query("SELECT COALESCE(SUM(jumlah), 0) AS total_kapasitas FROM slot_parkir");
    const [occupiedData] = await query("SELECT COUNT(*) AS total_terisi FROM log_parkir WHERE status_parkir = 'MASUK' AND waktu_keluar IS NULL");

    const totalKapasitas = parseInt(slotData?.total_kapasitas || 0);
    const totalTerisi = parseInt(occupiedData?.total_terisi || 0);

    if (totalTerisi >= totalKapasitas) {
      return res.status(400).json({ status: "error", message: "Slot parkir penuh" });
    }

    // Cek kuota
    let [kuota] = await query(
      "SELECT id_kuota, batas_parkir, jumlah_terpakai FROM kuota_parkir WHERE id_kendaraan = ? AND periode_bulan = ? LIMIT 1",
      [id_kendaraan, periode]
    );

    if (!kuota) {
      const [baseKuota] = await query(
        "SELECT batas_parkir FROM kuota_parkir WHERE npm = ? AND periode_bulan IS NULL ORDER BY id_kuota DESC LIMIT 1",
        [npm]
      );

      if (!baseKuota) {
        return res.status(400).json({ status: "error", message: "Kuota belum diatur oleh admin" });
      }

      const result = await query(
        "INSERT INTO kuota_parkir (id_kendaraan, npm, periode_bulan, batas_parkir, jumlah_terpakai) VALUES (?, ?, ?, ?, 0)",
        [id_kendaraan, npm, periode, baseKuota.batas_parkir]
      );

      kuota = { id_kuota: result.insertId, batas_parkir: baseKuota.batas_parkir, jumlah_terpakai: 0 };
    }

    if (kuota.jumlah_terpakai >= kuota.batas_parkir) {
      return res.status(400).json({ status: "error", message: "Kuota parkir mahasiswa habis" });
    }

    await query(
      "INSERT INTO log_parkir (id_kendaraan, waktu_masuk, status_parkir) VALUES (?, NOW(), 'MASUK')",
      [id_kendaraan]
    );

    // Slot update removed, using dynamic calculation (kapasitas - terisi)
    await query("UPDATE kuota_parkir SET jumlah_terpakai = jumlah_terpakai + 1 WHERE id_kuota = ?", [kuota.id_kuota]);

    const io = req.app.get("io");
    if (io) io.emit("parking_update", { action: "MASUK_MANUAL", npm });

    return res.json({ status: "success", message: "Berhasil masuk (Manual)", servo: 1 });

  } catch (err) {
    console.error("parkirManual ERROR:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};


module.exports = {
  parkirManual,
};
