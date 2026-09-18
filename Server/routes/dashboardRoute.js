const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const protect = require("../middlewares/protect");
const router = express.Router();

const {getDashboard} = require("../controller/dashboardController");

router.get("/",authMiddleware, protect("admin"), getDashboard);

module.exports = router;