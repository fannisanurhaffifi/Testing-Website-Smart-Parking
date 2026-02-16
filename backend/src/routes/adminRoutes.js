const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  verifikasiPengguna,
  getDataPengguna,
  generateRFID,
  dashboardSummary,
  getDataParkir,
  exportParkirPDF,
  hapusPengguna,
  updateKuotaParkir,
  updateSlotParkir,
} = require("../controllers/adminController");

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

// VERIFIKASI / AKTIVASI AKUN (kirim email)
router.put("/pengguna/verifikasi", verifikasiPengguna);

// HAPUS PENGGUNA
router.delete("/pengguna/:npm", hapusPengguna);

// UPDATE KUOTA (INDIVIDU / GLOBAL)
router.put("/kuota", updateKuotaParkir);

/**
 * ====================================================
 * RFID
 * ====================================================
 */

// GENERATE RFID untuk kendaraan
router.post("/rfid/generate", generateRFID);

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
