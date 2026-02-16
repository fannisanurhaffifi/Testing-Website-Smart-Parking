const express = require("express");
const router = express.Router();

const {
  parkirScan,
} = require("../controllers/parkirController");

router.post("/scan", parkirScan);

module.exports = router;
