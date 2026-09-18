const Category = require("../model/category");
const Product = require("../model/product");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");


// CREATE
const categoryCreate = asyncHandler(async (req, res, next) => {

    const {
        name,
        description
    } = req.body;

    if (!name) {
        return next(
            new AppError("Category name is required", 400)
        );
    }

    const existingCategory = await Category.findOne({
        name: {
            $regex: `^${name.trim()}$`,
            $options: "i"
        }
    });

    if (existingCategory) {
        return next(
            new AppError("Category already exists", 409)
        );
    }

    const category = await Category.create({
        name: name.trim(),
        description
    });

    res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category
    });
});


// GET ALL
const categoryGet = asyncHandler(async (req, res) => {

    const {
        search,
        status
    } = req.query;

    const filter = {};

    if (search) {
        filter.name = {
            $regex: search,
            $options: "i"
        };
    }

    if (status) {
        filter.status = status;
    }

    const categories = await Category.find(filter)
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});


// GET BY ID
const categoryGetById = asyncHandler(
    async (req, res, next) => {

        const category =
            await Category.findById(req.params.id);

        if (!category) {
            return next(
                new AppError("Category not found", 404)
            );
        }

        res.status(200).json({
            success: true,
            data: category
        });
    }
);


// UPDATE
const categoryUpdateById = asyncHandler(
    async (req, res, next) => {

        const category =
            await Category.findById(req.params.id);

        if (!category) {
            return next(
                new AppError("Category not found", 404)
            );
        }

        const {
            name,
            description,
            status
        } = req.body;

        if (name && name !== category.name) {

            const existing =
                await Category.findOne({
                    name: {
                        $regex: `^${name.trim()}$`,
                        $options: "i"
                    },
                    _id: {
                        $ne: category._id
                    }
                });

            if (existing) {
                return next(
                    new AppError(
                        "Category name already exists",
                        409
                    )
                );
            }

            category.name = name.trim();
        }

        if (description !== undefined) {
            category.description = description;
        }

        if (status !== undefined) {

            if (!["active", "inactive"].includes(status)) {
                return next(
                    new AppError(
                        "Invalid category status",
                        400
                    )
                );
            }

            category.status = status;
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    }
);


// DELETE / SOFT DELETE
const deleteCategory = asyncHandler(
    async (req, res, next) => {

        const category =
            await Category.findById(req.params.id);

        if (!category) {
            return next(
                new AppError("Category not found", 404)
            );
        }

        const productCount =
            await Product.countDocuments({
                category: category._id
            });

        if (productCount > 0) {

            category.status = "inactive";

            await category.save();

            return res.status(200).json({
                success: true,
                message:
                    "Category has products, so it was marked inactive",
                data: category
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    }
);


module.exports = {
    categoryCreate,
    categoryGet,
    categoryGetById,
    categoryUpdateById,
    deleteCategory
};