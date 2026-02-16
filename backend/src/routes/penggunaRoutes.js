const express = require("express");
const router = express.Router();

const {
   registerPengguna,
   loginPengguna,
   editProfilPengguna,
   riwayatParkirPengguna,
   logoutPengguna,
   requestOtp,
   verifyOtp,
   resetPasswordOtp,
   getProfilPengguna,
   changePassword,
} = require("../controllers/penggunaController");

const upload = require("../utils/upload");

/* ====================================================
   AUTH ROUTES
==================================================== */

// REGISTER
router.post("/auth/register", upload.single("stnk"), registerPengguna);

// LOGIN
router.post("/auth/login", loginPengguna);

// LOGOUT
router.post("/auth/logout", logoutPengguna);

// REQUEST OTP
router.post("/auth/request-otp", requestOtp);

// VERIFY OTP
router.post("/auth/verify-otp", verifyOtp);

// RESET PASSWORD (OTP)
router.post("/auth/reset-password", resetPasswordOtp);

/* ====================================================
   USER ROUTES
==================================================== */

// GET PROFIL
router.get("/users/profile/:npm", getProfilPengguna);

// UPDATE PROFIL
router.put(
   "/users/profile",
   upload.fields([
      { name: "foto", maxCount: 1 },
      { name: "stnk", maxCount: 1 },
   ]),
   editProfilPengguna
);


// RIWAYAT PARKIR
router.get("/users/riwayat/:npm", riwayatParkirPengguna);

// CHANGE PASSWORD (langsung tanpa OTP - untuk halaman profil)
router.post("/users/change-password", changePassword);

module.exports = router;
