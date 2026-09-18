const mongoose = require("mongoose");

const Product = require("../model/product");
const InventoryTransaction =
    require("../model/inventoryTransaction");

const AppError = require("../utils/AppError");
const asyncHandler =
    require("../utils/asyncHandler");


// STOCK IN

const stockIn = asyncHandler(
    async (req, res, next) => {

        const {
            productId,
            quantity,
            reason
        } = req.body;

        if (!productId) {
            return next(
                new AppError(
                    "Product ID is required",
                    400
                )
            );
        }

        if (
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return next(
                new AppError(
                    "Invalid product ID",
                    400
                )
            );
        }

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return next(
                new AppError(
                    "Quantity must be a positive integer",
                    400
                )
            );
        }

        if (!reason || !reason.trim()) {
            return next(
                new AppError(
                    "Reason is required",
                    400
                )
            );
        }

        const session =
            await mongoose.startSession();

        try {

            let transactionData;

            await session.withTransaction(
                async () => {

                    const product =
                        await Product.findById(
                            productId
                        ).session(session);

                    if (!product) {
                        throw new AppError(
                            "Product not found",
                            404
                        );
                    }

                    if (product.status !== "active") {
                        throw new AppError(
                            "Cannot update inactive product",
                            400
                        );
                    }

                    const previousStock =
                        product.stock;

                    const newStock =
                        previousStock + quantity;

                    await Product.updateOne(
                        {
                            _id: productId
                        },
                        {
                            $inc: {
                                stock: quantity
                            }
                        }
                    ).session(session);

                    const [transaction] =
                        await InventoryTransaction.create(
                            [
                                {
                                    product: productId,
                                    quantity,
                                    type: "IN",
                                    previousStock,
                                    newStock,
                                    reason: reason.trim(),
                                    referenceType: "MANUAL",
                                    performedBy:
                                        req.user._id
                                }
                            ],
                            {
                                session
                            }
                        );

                    transactionData =
                        transaction;
                }
            );

            const updatedProduct =
                await Product.findById(productId);

            res.status(200).json({
                success: true,
                message:
                    "Stock added successfully",
                data: {
                    product: updatedProduct,
                    transaction: transactionData
                }
            });

        } finally {

            await session.endSession();
        }
    }
);


// STOCK OUT

const stockOut = asyncHandler(
    async (req, res, next) => {

        const {
            productId,
            quantity,
            reason
        } = req.body;

        if (!productId) {
            return next(
                new AppError(
                    "Product ID is required",
                    400
                )
            );
        }

        if (
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return next(
                new AppError(
                    "Invalid product ID",
                    400
                )
            );
        }

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return next(
                new AppError(
                    "Quantity must be a positive integer",
                    400
                )
            );
        }

        if (!reason || !reason.trim()) {
            return next(
                new AppError(
                    "Reason is required",
                    400
                )
            );
        }

        const session =
            await mongoose.startSession();

        try {

            let transactionData;
            let updatedProduct;

            await session.withTransaction(
                async () => {

                    const product =
                        await Product.findById(
                            productId
                        ).session(session);

                    if (!product) {
                        throw new AppError(
                            "Product not found",
                            404
                        );
                    }

                    if (product.status !== "active") {
                        throw new AppError(
                            "Cannot update inactive product",
                            400
                        );
                    }

                    const previousStock =
                        product.stock;

                    // Atomic stock protection
                    updatedProduct =
                        await Product.findOneAndUpdate(
                            {
                                _id: productId,
                                stock: {
                                    $gte: quantity
                                }
                            },
                            {
                                $inc: {
                                    stock: -quantity
                                }
                            },
                            {
                                new: true,
                                session
                            }
                        );

                    if (!updatedProduct) {
                        throw new AppError(
                            "Insufficient stock",
                            400
                        );
                    }

                    const newStock =
                        updatedProduct.stock;

                    const [transaction] =
                        await InventoryTransaction.create(
                            [
                                {
                                    product: productId,
                                    quantity,
                                    type: "OUT",
                                    previousStock,
                                    newStock,
                                    reason: reason.trim(),
                                    referenceType: "MANUAL",
                                    performedBy:
                                        req.user._id
                                }
                            ],
                            {
                                session
                            }
                        );

                    transactionData =
                        transaction;
                }
            );

            res.status(200).json({
                success: true,
                message:
                    "Stock removed successfully",
                data: {
                    product: updatedProduct,
                    transaction: transactionData
                }
            });

        } finally {

            await session.endSession();
        }
    }
);


// STOCK ADJUSTMENT

const stockAdjustment = asyncHandler(
    async (req, res, next) => {

        const {
            productId,
            newStock,
            reason
        } = req.body;

        if (!productId) {
            return next(
                new AppError(
                    "Product ID is required",
                    400
                )
            );
        }

        if (
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return next(
                new AppError(
                    "Invalid product ID",
                    400
                )
            );
        }

        if (
            !Number.isInteger(newStock) ||
            newStock < 0
        ) {
            return next(
                new AppError(
                    "New stock must be a non-negative integer",
                    400
                )
            );
        }

        if (!reason || !reason.trim()) {
            return next(
                new AppError(
                    "Reason is required",
                    400
                )
            );
        }

        const session =
            await mongoose.startSession();

        try {

            let transactionData;
            let updatedProduct;

            await session.withTransaction(
                async () => {

                    const product =
                        await Product.findById(
                            productId
                        ).session(session);

                    if (!product) {
                        throw new AppError(
                            "Product not found",
                            404
                        );
                    }

                    if (product.status !== "active") {
                        throw new AppError(
                            "Cannot update inactive product",
                            400
                        );
                    }

                    const previousStock =
                        product.stock;

                    updatedProduct =
                        await Product.findByIdAndUpdate(
                            productId,
                            {
                                stock: newStock
                            },
                            {
                                new: true,
                                runValidators: true,
                                session
                            }
                        );

                    const difference =
                        Math.abs(
                            newStock -
                            previousStock
                        );

                    const [transaction] =
                        await InventoryTransaction.create(
                            [
                                {
                                    product: productId,
                                    quantity:
                                        difference || 1,
                                    type: "ADJUSTMENT",
                                    previousStock,
                                    newStock,
                                    reason: reason.trim(),
                                    referenceType: "MANUAL",
                                    performedBy:
                                        req.user._id
                                }
                            ],
                            {
                                session
                            }
                        );

                    transactionData =
                        transaction;
                }
            );

            res.status(200).json({
                success: true,
                message:
                    "Stock adjusted successfully",
                data: {
                    product: updatedProduct,
                    transaction: transactionData
                }
            });

        } finally {

            await session.endSession();
        }
    }
);


// PRODUCT INVENTORY HISTORY

const getProductHistory =
    asyncHandler(
        async (req, res, next) => {

            const { productId } =
                req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    productId
                )
            ) {
                return next(
                    new AppError(
                        "Invalid product ID",
                        400
                    )
                );
            }

            const product =
                await Product.findById(productId);

            if (!product) {
                return next(
                    new AppError(
                        "Product not found",
                        404
                    )
                );
            }

            const {
                type,
                page = 1,
                limit = 20
            } = req.query;

            const filter = {
                product: productId
            };

            if (type) {

                if (
                    ![
                        "IN",
                        "OUT",
                        "ADJUSTMENT"
                    ].includes(type)
                ) {
                    return next(
                        new AppError(
                            "Invalid transaction type",
                            400
                        )
                    );
                }

                filter.type = type;
            }

            const pageNumber =
                Math.max(Number(page), 1);

            const limitNumber =
                Math.min(
                    Math.max(Number(limit), 1),
                    100
                );

            const skip =
                (pageNumber - 1) *
                limitNumber;

            const [
                transactions,
                total
            ] = await Promise.all([

                InventoryTransaction
                    .find(filter)
                    .populate(
                        "performedBy",
                        "name email role"
                    )
                    .sort({
                        createdAt: -1
                    })
                    .skip(skip)
                    .limit(limitNumber),

                InventoryTransaction
                    .countDocuments(filter)
            ]);

            res.status(200).json({
                success: true,
                count:
                    transactions.length,
                total,
                page: pageNumber,
                pages: Math.ceil(
                    total / limitNumber
                ),
                data: transactions
            });
        }
    );


module.exports = {
    stockIn,
    stockOut,
    stockAdjustment,
    getProductHistory
};