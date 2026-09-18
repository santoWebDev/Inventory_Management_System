const express = require('express')
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const protect =require("../middlewares/protect");

const { stockIn, stockOut,stockAdjustment, getProductHistory} = require('../controller/inventoryController');

router.post('/stock-in',authMiddleware, protect("admin", "employee"), stockIn)
router.post('/stock-out',authMiddleware, protect("admin", "employee"), stockOut)
router.post("/adjustment",authMiddleware, protect("admin"),stockAdjustment);
router.get('/:productId/history',authMiddleware,protect("admin", "employee"), getProductHistory)

module.exports = router;