const jwt = require("jsonwebtoken");
const User = require("../model/user");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(
            new AppError("Authentication token required", 401)
        );
    }

    if (!authHeader.startsWith("Bearer ")) {
        return next(
            new AppError("Invalid authorization format", 401)
        );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return next(
            new AppError("Authentication token required", 401)
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (error) {
        return next(
            new AppError("Invalid or expired token", 401)
        );
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        return next(
            new AppError("User no longer exists", 401)
        );
    }

    if (user.status === "inactive") {
        return next(
            new AppError("Your account is inactive", 403)
        );
    }

    req.user = user;

    next();
});

module.exports = authMiddleware;