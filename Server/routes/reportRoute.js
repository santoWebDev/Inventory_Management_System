const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const protect = require("../middlewares/protect");
const router = express.Router();

const { getSalesReport, getInventoryReport} = require("../controller/reportController");

router.get("/sales", authMiddleware, protect("admin"), getSalesReport);
router.get("/inventory", authMiddleware, protect("admin"), getInventoryReport);

module.exports = router;