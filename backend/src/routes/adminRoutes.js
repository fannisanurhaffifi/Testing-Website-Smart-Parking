const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  getDataPengguna,
  dashboardSummary,
  getDataParkir,
  exportParkirPDF,
  hapusPengguna,
  updateKuotaParkir,
  updateSlotParkir,
  verifikasiPengguna,
} = require("../controllers/adminController");

const { parkirManual } = require("../controllers/parkirController");

/**
 * ====================================================
 * AUTH ADMIN
 * Base: /api/admin
 * ====================================================
 */

// LOGIN ADMIN
router.post("/login", loginAdmin);

/**
 * ====================================================
 * MANAJEMEN PENGGUNA
 * ====================================================
 */

// GET semua pengguna
router.get("/pengguna", getDataPengguna);

// VERIFIKASI / UPDATE STATUS
router.put("/pengguna/verifikasi", verifikasiPengguna);



// HAPUS PENGGUNA
router.delete("/pengguna/:npm", hapusPengguna);

// UPDATE KUOTA (INDIVIDU / GLOBAL)
router.put("/kuota", updateKuotaParkir);

// AKSI PARKIR MANUAL
router.post("/parkir/manual", parkirManual);



/**
 * ====================================================
 * DASHBOARD
 * ====================================================
 */

// SUMMARY DASHBOARD
router.get("/dashboard/summary", dashboardSummary);

// UPDATE SLOT PARKIR
router.put("/slot", updateSlotParkir);

/**
 * ====================================================
 * DATA PARKIR
 * ====================================================
 */

// LIST DATA PARKIR
router.get("/parkir", getDataParkir);

// EXPORT PDF
router.get("/parkir/export/pdf", exportParkirPDF);

module.exports = router;
