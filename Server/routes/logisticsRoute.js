const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const protect = require("../middlewares/protect");
const {
  createLogistics,
  getLogistics,
  getLogisticsById,
  updateLogistics,
} = require("../controller/logisticsController");

router.get("/", authMiddleware, getLogistics);
router.post("/", authMiddleware, protect("admin", "employee"), createLogistics);
router.get("/:id", authMiddleware, getLogisticsById);
router.put("/:id", authMiddleware, protect("admin", "employee"), updateLogistics);

module.exports = router;
