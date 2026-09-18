const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const protect = require('../middlewares/protect');

const { createUser,
    loginUser,
    getMe,
    updateMyProfile,
    getUsers,
    getUserById,
    updateUserById,
    updateUserStatus } = require("../controller/userController");
router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMyProfile);
router.get('/', authMiddleware, protect("admin"), getUsers);
router.get('/:id', authMiddleware, protect("admin"), getUserById);
router.put('/:id', authMiddleware, protect("admin"), updateUserById);
router.patch('/:id/status', authMiddleware, protect("admin"), updateUserStatus);

module.exports = router;
