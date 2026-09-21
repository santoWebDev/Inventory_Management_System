const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const protect = require("../middlewares/protect");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controller/customerController");

router.get("/", authMiddleware, getCustomers);
router.post("/", authMiddleware, protect("admin", "employee"), createCustomer);
router.get("/:id", authMiddleware, getCustomerById);
router.put("/:id", authMiddleware, protect("admin", "employee"), updateCustomer);
router.delete("/:id", authMiddleware, protect("admin"), deleteCustomer);

module.exports = router;
