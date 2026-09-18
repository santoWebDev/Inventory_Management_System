const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const protect = require('../middlewares/protect')


const { createProduct, getProducts, getProduct, updateProduct, deleteProduct } = require('../controller/productController');

router.post('/',  authMiddleware, protect("admin"),createProduct);
router.get('/', authMiddleware, getProducts);
router.get('/:id', authMiddleware, getProduct);
router.put('/:id', authMiddleware, protect("admin","employee"), updateProduct);
router.delete('/:id', authMiddleware, protect("admin"), deleteProduct);

module.exports = router;    