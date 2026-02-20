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
    // 📅 Data Harian (00.00 - 23.59)
    const targetDate = specificDate || new Date().toLocaleDateString('en-CA');
    query = `
      SELECT 
        HOUR(DATE_ADD(waktu_masuk, INTERVAL 7 HOUR)) AS hour_val,
        COUNT(*) AS total
      FROM log_parkir
      WHERE waktu_masuk >= DATE_SUB(?, INTERVAL 7 HOUR) 
        AND waktu_masuk <= DATE_SUB(?, INTERVAL 7 HOUR)
      GROUP BY hour_val
    `;
    params.push(`${targetDate} 00:00:00`, `${targetDate} 23:59:59`);
    labels = Array.from({ length: 24 }, (_, i) => i);
    displayLabels = labels.map(h => `${String(h).padStart(2, '0')}.00`);
  }

  if (periode === "mingguan") {
    // 📅 MINGGUAN (Range filter atau Minggu Ini)
    if (from && to) {
      query = `
        SELECT 
          DAYOFWEEK(DATE_ADD(waktu_masuk, INTERVAL 7 HOUR)) AS day_val,
          COUNT(*) AS total
        FROM log_parkir
        WHERE waktu_masuk >= DATE_SUB(?, INTERVAL 7 HOUR) 
          AND waktu_masuk <= DATE_SUB(?, INTERVAL 7 HOUR)
        GROUP BY day_val
      `;
      params.push(`${from} 00:00:00`, `${to} 23:59:59`);
    } else {
      query = `
        SELECT 
          DAYOFWEEK(DATE_ADD(waktu_masuk, INTERVAL 7 HOUR)) AS day_val,
          COUNT(*) AS total
        FROM log_parkir
        WHERE YEARWEEK(DATE_ADD(waktu_masuk, INTERVAL 7 HOUR), 1) = YEARWEEK(DATE_ADD(CURDATE(), INTERVAL 7 HOUR), 1)
        GROUP BY day_val
      `;
    }
    // 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
    labels = [2, 3, 4, 5, 6, 7, 1]; // Urutan Senin ke Minggu
    displayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  }

  if (periode === "bulanan") {
    // 📅 BULANAN (Per bulan dalam 1 tahun)
    const targetYear = specificDate ? specificDate.split('-')[0] : new Date().getFullYear();
    query = `
      SELECT 
        MONTH(DATE_ADD(waktu_masuk, INTERVAL 7 HOUR)) AS month_val,
        COUNT(*) AS total
      FROM log_parkir
      WHERE waktu_masuk >= DATE_SUB(?, INTERVAL 7 HOUR) 
        AND waktu_masuk <= DATE_SUB(?, INTERVAL 7 HOUR)
      GROUP BY month_val
    `;
    params.push(`${targetYear}-01-01 00:00:00`, `${targetYear}-12-31 23:59:59`);
    labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    displayLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  }

  console.log(`📊 [getStatistikByPeriode] Params: periode=${periode}, from=${from}, to=${to}, date=${specificDate}`);
  console.log(`🔍 [getStatistikByPeriode] Query: ${query.replace(/\s+/g, ' ').trim()}`);
  console.log(`📦 [getStatistikByPeriode] Params array:`, params);

  const rows = await db.query(query, params);
  console.log(`📈 [getStatistikByPeriode] Rows returned:`, rows.length);

  const dataMap = {};

  rows.forEach((row) => {
    // Mapping key berdasarkan kolom yang tersedia di query
    // Gunakan String() untuk key agar konsisten
    const rawKey = row.hour_val !== undefined ? row.hour_val :
      row.day_val !== undefined ? row.day_val :
        row.month_val;

    if (rawKey !== undefined && rawKey !== null) {
      dataMap[String(rawKey)] = row.total;
    }
  });

  const finalData = labels.map((l) => dataMap[String(l)] || 0);
  console.log(`✅ [getStatistikByPeriode] Final Labels:`, displayLabels);
  console.log(`✅ [getStatistikByPeriode] Final Data:`, finalData);

  return {
    labels: displayLabels,
    data: finalData,
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
