const mongoose = require("mongoose");

const Order = require("../model/order");
const Product = require("../model/product");
const InventoryTransaction =
    require("../model/inventoryTransaction");

const AppError =
    require("../utils/AppError");

const asyncHandler =
    require("../utils/asyncHandler");


// =====================================================
// SALES REPORT
// =====================================================

const getSalesReport = asyncHandler(
    async (req, res, next) => {

        const {
            from,
            to,
            status
        } = req.query;


        const match = {};


        // =========================================
        // STATUS FILTER
        // =========================================

        if (status) {

            const allowedStatuses = [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ];

            if (
                !allowedStatuses.includes(status)
            ) {
                return next(
                    new AppError(
                        "Invalid order status",
                        400
                    )
                );
            }

            match.status = status;
        }


        // =========================================
        // DATE FILTER
        // =========================================

        if (from || to) {

            match.createdAt = {};

            if (from) {

                const fromDate =
                    new Date(from);

                if (
                    Number.isNaN(
                        fromDate.getTime()
                    )
                ) {
                    return next(
                        new AppError(
                            "Invalid from date",
                            400
                        )
                    );
                }

                match.createdAt.$gte =
                    fromDate;
            }


            if (to) {

                const toDate =
                    new Date(to);

                if (
                    Number.isNaN(
                        toDate.getTime()
                    )
                ) {
                    return next(
                        new AppError(
                            "Invalid to date",
                            400
                        )
                    );
                }

                // Include entire "to" day
                toDate.setHours(
                    23,
                    59,
                    59,
                    999
                );

                match.createdAt.$lte =
                    toDate;
            }
        }


        // =========================================
        // SUMMARY
        // =========================================

        const summary =
            await Order.aggregate([
                {
                    $match: match
                },

                {
                    $group: {

                        _id: null,

                        totalOrders: {
                            $sum: 1
                        },

                        totalSales: {
                            $sum: {
                                $cond: [
                                    {
                                        $ne: [
                                            "$status",
                                            "cancelled"
                                        ]
                                    },

                                    "$totalAmount",

                                    0
                                ]
                            }
                        },

                        cancelledOrders: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$status",
                                            "cancelled"
                                        ]
                                    },

                                    1,

                                    0
                                ]
                            }
                        }
                    }
                }
            ]);


        // =========================================
        // SALES BY DAY
        // =========================================

        const salesByDay =
            await Order.aggregate([
                {
                    $match: {
                        ...match,

                        status: {
                            $ne: "cancelled"
                        }
                    }
                },

                {
                    $group: {

                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },

                        orders: {
                            $sum: 1
                        },

                        sales: {
                            $sum: "$totalAmount"
                        }
                    }
                },

                {
                    $sort: {
                        _id: 1
                    }
                }
            ]);


        // =========================================
        // TOP PRODUCTS
        // =========================================

        const topProducts =
            await Order.aggregate([
                {
                    $match: {
                        ...match,

                        status: {
                            $ne: "cancelled"
                        }
                    }
                },

                {
                    $unwind: "$items"
                },

                {
                    $group: {

                        _id:
                            "$items.product",

                        productName: {
                            $first:
                                "$items.name"
                        },

                        quantitySold: {
                            $sum:
                                "$items.quantity"
                        },

                        revenue: {
                            $sum:
                                "$items.subtotal"
                        }
                    }
                },

                {
                    $sort: {
                        revenue: -1
                    }
                },

                {
                    $limit: 10
                }
            ]);


        res.status(200).json({

            success: true,

            data: {

                summary:
                    summary.length
                        ? summary[0]
                        : {
                            totalOrders: 0,
                            totalSales: 0,
                            cancelledOrders: 0
                        },

                salesByDay,

                topProducts
            }
        });
    }
);


// =====================================================
// INVENTORY REPORT
// =====================================================

const getInventoryReport =
    asyncHandler(
        async (req, res, next) => {

            const {
                type,
                productId
            } = req.query;


            const filter = {};


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


            if (productId) {

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

                filter.product =
                    productId;
            }


            // =====================================
            // TRANSACTION SUMMARY
            // =====================================

            const transactionSummary =
                await InventoryTransaction.aggregate([
                    {
                        $match:
                            filter
                    },

                    {
                        $group: {

                            _id:
                                "$type",

                            totalTransactions: {
                                $sum: 1
                            },

                            totalQuantity: {
                                $sum:
                                    "$quantity"
                            }
                        }
                    }
                ]);


            // =====================================
            // PRODUCT STOCK REPORT
            // =====================================

            const products =
                await Product.find()
                    .populate(
                        "category",
                        "name"
                    )
                    .populate(
                        "supplier",
                        "name"
                    )
                    .select(
                        "name price stock lowStockThreshold status category supplier"
                    )
                    .sort({
                        stock: 1
                    });


            const productReport =
                products.map(
                    product => {

                        let stockStatus =
                            "IN_STOCK";


                        if (
                            product.stock === 0
                        ) {

                            stockStatus =
                                "OUT_OF_STOCK";

                        } else if (
                            product.stock <=
                            product.lowStockThreshold
                        ) {

                            stockStatus =
                                "LOW_STOCK";
                        }


                        return {

                            id:
                                product._id,

                            name:
                                product.name,

                            price:
                                product.price,

                            stock:
                                product.stock,

                            lowStockThreshold:
                                product.lowStockThreshold,

                            stockStatus,

                            status:
                                product.status,

                            category:
                                product.category,

                            supplier:
                                product.supplier
                        };
                    }
                );


            res.status(200).json({

                success: true,

                data: {

                    transactionSummary,

                    products:
                        productReport
                }
            });
        }
    );


module.exports = {
    getSalesReport,
    getInventoryReport
};