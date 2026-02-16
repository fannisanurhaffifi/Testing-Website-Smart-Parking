const db = require("../config/database");

/**
 * =====================================
 * HELPER (WAJIB ADA)
 * =====================================
 */
const getStatistikByPeriode = async (periode, from, to, specificDate) => {
  let query = "";
  let params = [];
  let labels = [];
  let displayLabels = [];

  if (periode === "harian") {
    // 📅 Data Harian (00.00 - 23.00)
    query = `
      SELECT 
        HOUR(waktu_masuk) AS hour_val,
        COUNT(*) AS total
      FROM log_parkir
      WHERE DATE(waktu_masuk) = ${specificDate ? "?" : "CURDATE()"}
      GROUP BY hour_val
    `;
    if (specificDate) params.push(specificDate);
    labels = Array.from({ length: 24 }, (_, i) => i);
    displayLabels = labels.map(h => `${String(h).padStart(2, '0')}.00`);
  }

  if (periode === "mingguan") {
    // 📅 MINGGU INI (Senin - Minggu)
    if (from && to) {
      query = `
        SELECT 
          DAYOFWEEK(waktu_masuk) AS day_val,
          COUNT(*) AS total
        FROM log_parkir
        WHERE DATE(waktu_masuk) BETWEEN ? AND ?
        GROUP BY day_val
      `;
      params.push(from, to);
    } else {
      query = `
        SELECT 
          DAYOFWEEK(waktu_masuk) AS day_val,
          COUNT(*) AS total
        FROM log_parkir
        WHERE YEARWEEK(waktu_masuk, 1) = YEARWEEK(CURDATE(), 1)
        GROUP BY day_val
      `;
    }
    // 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
    labels = [2, 3, 4, 5, 6, 7, 1]; // Urutan Senin ke Minggu
    displayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  }

  if (periode === "bulanan") {
    // 📅 TAHUN INI (Januari - Desember)
    const targetYear = specificDate ? specificDate.split('-')[0] : new Date().getFullYear();
    query = `
      SELECT 
        MONTH(waktu_masuk) AS month_val,
        COUNT(*) AS total
      FROM log_parkir
      WHERE YEAR(waktu_masuk) = ?
      GROUP BY month_val
    `;
    params.push(targetYear);
    labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    displayLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  }

  const rows = await db.query(query, params);
  const dataMap = {};

  rows.forEach((row) => {
    // Mapping key berdasarkan kolom yang tersedia di query
    const key = row.hour_val !== undefined ? row.hour_val :
      row.day_val !== undefined ? row.day_val :
        row.month_val;
    if (key !== undefined) dataMap[key] = row.total;
  });

  return {
    labels: displayLabels,
    data: labels.map((l) => dataMap[l] || 0),
  };
};

/**
 * =====================================
 * CONTROLLER
 * =====================================
 */
const getStatistikKendaraan = async (req, res) => {
  try {
    const { periode, from, to, date } = req.query;

    if (!["harian", "mingguan", "bulanan"].includes(periode)) {
      return res.status(400).json({
        success: false,
        message: "Periode tidak valid",
      });
    }

    const statistik = await getStatistikByPeriode(periode, from, to, date);

    res.json({
      success: true,
      labels: statistik.labels,
      data: statistik.data,
    });
  } catch (error) {
    console.error("Statistik Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStatistikKendaraan,
};
