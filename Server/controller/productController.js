const Product = require("../model/product");
const Category = require("../model/category");
const Supplier = require("../model/supplier");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");


// CREATE PRODUCT
const createProduct = asyncHandler(
    async (req, res, next) => {

        const {
            name,
            description,
            price,
            category,
            supplier,
            stock,
            lowStockThreshold
        } = req.body;

        if (
            !name ||
            price === undefined ||
            !category ||
            !supplier
        ) {
            return next(
                new AppError(
                    "Name, price, category and supplier are required",
                    400
                )
            );
        }

        if (price < 0) {
            return next(
                new AppError(
                    "Price cannot be negative",
                    400
                )
            );
        }

        if (stock !== undefined && stock < 0) {
            return next(
                new AppError(
                    "Stock cannot be negative",
                    400
                )
            );
        }

        const existingProduct =
            await Product.findOne({
                name: {
                    $regex: `^${name.trim()}$`,
                    $options: "i"
                }
            });

        if (existingProduct) {
            return next(
                new AppError(
                    "Product already exists",
                    409
                )
            );
        }

        const categoryDoc =
            await Category.findById(category);

        if (!categoryDoc) {
            return next(
                new AppError(
                    "Category not found",
                    404
                )
            );
        }

        if (categoryDoc.status !== "active") {
            return next(
                new AppError(
                    "Cannot use an inactive category",
                    400
                )
            );
        }

        const supplierDoc =
            await Supplier.findById(supplier);

        if (!supplierDoc) {
            return next(
                new AppError(
                    "Supplier not found",
                    404
                )
            );
        }

        if (supplierDoc.status !== "active") {
            return next(
                new AppError(
                    "Cannot use an inactive supplier",
                    400
                )
            );
        }

        const product = await Product.create({
            name: name.trim(),
            description,
            price,
            category,
            supplier,
            stock: stock || 0,
            lowStockThreshold
        });

        const populatedProduct =
            await Product.findById(product._id)
                .populate("category", "name status")
                .populate("supplier", "name email number status");

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: populatedProduct
        });
    }
);


// GET PRODUCTS
const getProducts = asyncHandler(
    async (req, res) => {

        const {
            search,
            category,
            supplier,
            status,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) {
            filter.category = category;
        }

        if (supplier) {
            filter.supplier = supplier;
        }

        if (status) {
            filter.status = status;
        }

        if (
            minPrice !== undefined ||
            maxPrice !== undefined
        ) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        const pageNumber = Math.max(
            Number(page),
            1
        );

        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const skip =
            (pageNumber - 1) * limitNumber;

        const [
            products,
            total
        ] = await Promise.all([

            Product.find(filter)
                .populate("category", "name status")
                .populate(
                    "supplier",
                    "name email number status"
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Product.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: pageNumber,
            pages: Math.ceil(
                total / limitNumber
            ),
            data: products
        });
    }
);


// GET PRODUCT
const getProduct = asyncHandler(
    async (req, res, next) => {

        const product =
            await Product.findById(req.params.id)
                .populate(
                    "category",
                    "name status"
                )
                .populate(
                    "supplier",
                    "name email number status"
                );

        if (!product) {
            return next(
                new AppError(
                    "Product not found",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            data: product
        });
    }
);


// UPDATE PRODUCT
const updateProduct = asyncHandler(
    async (req, res, next) => {

        const product =
            await Product.findById(req.params.id);

        if (!product) {
            return next(
                new AppError(
                    "Product not found",
                    404
                )
            );
        }

        const {
            name,
            description,
            price,
            category,
            supplier,
            lowStockThreshold,
            status
        } = req.body;

        // Stock intentionally NOT handled here.
        // Stock must go through inventory APIs.

        if (name !== undefined) {

            const existing =
                await Product.findOne({
                    name: {
                        $regex: `^${name.trim()}$`,
                        $options: "i"
                    },
                    _id: {
                        $ne: product._id
                    }
                });

            if (existing) {
                return next(
                    new AppError(
                        "Product name already exists",
                        409
                    )
                );
            }

            product.name = name.trim();
        }

        if (description !== undefined) {
            product.description = description;
        }

        if (price !== undefined) {

            if (price < 0) {
                return next(
                    new AppError(
                        "Price cannot be negative",
                        400
                    )
                );
            }

            product.price = price;
        }

        if (category !== undefined) {

            const categoryDoc =
                await Category.findById(category);

            if (!categoryDoc) {
                return next(
                    new AppError(
                        "Category not found",
                        404
                    )
                );
            }

            if (categoryDoc.status !== "active") {
                return next(
                    new AppError(
                        "Category is inactive",
                        400
                    )
                );
            }

            product.category = category;
        }

        if (supplier !== undefined) {

            const supplierDoc =
                await Supplier.findById(supplier);

            if (!supplierDoc) {
                return next(
                    new AppError(
                        "Supplier not found",
                        404
                    )
                );
            }

            if (supplierDoc.status !== "active") {
                return next(
                    new AppError(
                        "Supplier is inactive",
                        400
                    )
                );
            }

            product.supplier = supplier;
        }

        if (lowStockThreshold !== undefined) {

            if (lowStockThreshold < 0) {
                return next(
                    new AppError(
                        "Low stock threshold cannot be negative",
                        400
                    )
                );
            }

            product.lowStockThreshold =
                lowStockThreshold;
        }

        if (status !== undefined) {

            if (
                !["active", "inactive"]
                    .includes(status)
            ) {
                return next(
                    new AppError(
                        "Invalid product status",
                        400
                    )
                );
            }

            product.status = status;
        }

        await product.save();

        const updatedProduct =
            await Product.findById(product._id)
                .populate(
                    "category",
                    "name status"
                )
                .populate(
                    "supplier",
                    "name email number status"
                );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    }
);


// DELETE PRODUCT
const deleteProduct = asyncHandler(
    async (req, res, next) => {

        const product =
            await Product.findById(req.params.id);

        if (!product) {
            return next(
                new AppError(
                    "Product not found",
                    404
                )
            );
        }

        // For now, deactivate instead of hard delete.
        product.status = "inactive";

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product marked inactive",
            data: product
        });
    }
);


module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
};