const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const protect = require("../middlewares/protect");

const { createSupplier, getSupplier, getSupplierById, updateSupplier ,deleteSupplier} = require("../controller/supplierController");

router.post('/',authMiddleware, protect("admin"), createSupplier);
router.get('/',authMiddleware, getSupplier);
router.get('/:id',authMiddleware, getSupplierById);
router.put('/:id',authMiddleware, protect("admin", "employee"), updateSupplier);
router.delete('/:id',authMiddleware, protect("admin"), deleteSupplier);
module.exports = router;