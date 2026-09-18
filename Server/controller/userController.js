const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/user");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");


const createToken = (user) => {

    return jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
};


// REGISTER
const createUser = asyncHandler(async (req, res, next) => {

    const {
        name,
        email,
        password
    } = req.body;

    if (!name || !email || !password) {
        return next(
            new AppError(
                "Name, email and password are required",
                400
            )
        );
    }

    const existingUser = await User.findOne({
        email: email.toLowerCase()
    });

    if (existingUser) {
        return next(
            new AppError("Email already registered", 409)
        );
    }

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "admin"
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
});


// LOGIN
const loginUser = asyncHandler(async (req, res, next) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return next(
            new AppError(
                "Email and password are required",
                400
            )
        );
    }

    const user = await User.findOne({
        email: email.toLowerCase()
    }).select("+password");

    if (!user) {
        return next(
            new AppError("Invalid email or password", 401)
        );
    }

    if (user.status === "inactive") {
        return next(
            new AppError("Your account is inactive", 403)
        );
    }

    const isPasswordCorrect =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isPasswordCorrect) {
        return next(
            new AppError("Invalid email or password", 401)
        );
    }

    const token = createToken(user);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,

        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
});


// CURRENT USER
const getMe = asyncHandler(async (req, res) => {

    res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            status: req.user.status
        }
    });
});


// UPDATE CURRENT USER PROFILE
const updateMyProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const { name, email, password } = req.body;

    if (name !== undefined) {
        if (String(name).trim().length < 2) {
            return next(new AppError("Name must contain at least 2 characters", 400));
        }
        user.name = String(name).trim();
    }

    if (email !== undefined) {
        const normalizedEmail = String(email).trim().toLowerCase();
        const existingEmail = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id }
        });

        if (existingEmail) {
            return next(new AppError("Email already exists", 409));
        }

        user.email = normalizedEmail;
    }

    if (password !== undefined && password !== "") {
        if (String(password).length < 6) {
            return next(new AppError("Password must contain at least 6 characters", 400));
        }

        user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
});


// GET USER BY ID
const getUserById = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new AppError("User not found", 404)
        );
    }

    res.status(200).json({
        success: true,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
});


// GET ALL USERS
const getUsers = asyncHandler(async (req, res) => {

    const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});


// UPDATE USER
const updateUserById = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id)
        .select("+password");

    if (!user) {
        return next(
            new AppError("User not found", 404)
        );
    }

    const {
        name,
        email,
        password
    } = req.body;

    if (name !== undefined) {
        user.name = name;
    }

    if (email !== undefined) {
        const existingEmail = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: user._id }
        });

        if (existingEmail) {
            return next(
                new AppError("Email already exists", 409)
            );
        }

        user.email = email.toLowerCase();
    }

    if (password !== undefined) {
        user.password = await bcrypt.hash(
            password,
            10
        );
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
});


// UPDATE USER STATUS
const updateUserStatus = asyncHandler(
    async (req, res, next) => {

        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return next(
                new AppError(
                    "Status must be active or inactive",
                    400
                )
            );
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return next(
                new AppError("User not found", 404)
            );
        }

        res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: {
                id: user._id,
                status: user.status
            }
        });
    }
);


module.exports = {
    createUser,
    loginUser,
    getMe,
    updateMyProfile,
    getUsers,
    getUserById,
    updateUserById,
    updateUserStatus
};