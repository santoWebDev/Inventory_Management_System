const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const protect = require("../middlewares/protect");

const { categoryCreate, categoryGet, categoryGetById, categoryUpdateById, deleteCategory } = require('../controller/categoryController');

router.post('/',authMiddleware, protect("admin"), categoryCreate);
router.get('/', authMiddleware,categoryGet);
router.get('/:id', authMiddleware, categoryGetById);
router.put('/:id',authMiddleware, protect("admin"), categoryUpdateById);
router.delete('/:id',authMiddleware, protect("admin"), deleteCategory);

module.exports = router; 