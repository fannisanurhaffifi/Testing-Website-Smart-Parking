const express = require("express");
const router = express.Router();

const { getStatCardParkir } = require("../controllers/statcardController");

// ⛔️ PATH INI HARUS "/parkir"
router.get("/parkir", getStatCardParkir);

module.exports = router;
