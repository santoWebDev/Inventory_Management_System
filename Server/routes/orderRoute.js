const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const protect = require("../middlewares/protect");
const router = express.Router();

const {
    createOrder,
    getOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} = require("../controller/orderController");


router.post("/", authMiddleware, protect("admin", "employee"), createOrder);
router.get("/", authMiddleware, protect("admin"), getOrders);
router.get("/my-orders", authMiddleware, protect("admin", "employee"), getMyOrders);
router.get("/:id", authMiddleware, protect("admin", "employee"), getOrderById);
router.patch("/:id/status", authMiddleware, protect("admin"), updateOrderStatus);
router.post("/:id/cancel", authMiddleware, protect("admin", "employee"), cancelOrder);

module.exports = router;