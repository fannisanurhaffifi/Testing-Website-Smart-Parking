const express = require("express");
const router = express.Router();

const { getStatistikKendaraan } = require("../controllers/statistikController");

// ⬇️ handler HARUS function
router.get("/kendaraan", getStatistikKendaraan);

module.exports = router;
