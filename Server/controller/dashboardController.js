const Product = require("../model/product");
const Category = require("../model/category");
const Supplier = require("../model/supplier");
const Order = require("../model/order");
const InventoryTransaction = require("../model/inventoryTransaction");
const asyncHandler = require("../utils/asyncHandler");


const getDashboard = asyncHandler(
    async (req, res) => {

        const [
            totalProducts,
            activeProducts,
            inactiveProducts,
            outOfStockProducts,
            lowStockProducts
        ] = await Promise.all([

            Product.countDocuments(),

            Product.countDocuments({
                status: "active"
            }),

            Product.countDocuments({
                status: "inactive"
            }),

            Product.countDocuments({
                stock: 0,
                status: "active"
            }),

            Product.countDocuments({
                status: "active",
                stock: {
                    $gt: 0
                },

                $expr: {
                    $lte: [
                        "$stock",
                        "$lowStockThreshold"
                    ]
                }
            })
        ]);


        // =========================================
        // CATEGORY / SUPPLIER
        // =========================================

        const [
            totalCategories,
            activeCategories,
            totalSuppliers,
            activeSuppliers
        ] = await Promise.all([

            Category.countDocuments(),

            Category.countDocuments({
                status: "active"
            }),

            Supplier.countDocuments(),

            Supplier.countDocuments({
                status: "active"
            })
        ]);


        // =========================================
        // ORDER COUNTS
        // =========================================

        const [
            totalOrders,
            pendingOrders,
            confirmedOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders
        ] = await Promise.all([

            Order.countDocuments(),

            Order.countDocuments({
                status: "pending"
            }),

            Order.countDocuments({
                status: "confirmed"
            }),

            Order.countDocuments({
                status: "shipped"
            }),

            Order.countDocuments({
                status: "delivered"
            }),

            Order.countDocuments({
                status: "cancelled"
            })
        ]);


        // =========================================
        // SALES
        // =========================================

        const salesResult =
            await Order.aggregate([
                {
                    $match: {
                        status: {
                            $ne: "cancelled"
                        }
                    }
                },

                {
                    $group: {
                        _id: null,

                        totalSales: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]);


        const totalSales =
            salesResult.length > 0
                ? salesResult[0].totalSales
                : 0;


        // =========================================
        // RECENT ORDERS
        // =========================================

        const recentOrders =
            await Order.find()
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "orderNumber user totalAmount status createdAt"
                );


        // =========================================
        // LOW STOCK PRODUCTS
        // =========================================

        const lowStockProductList =
            await Product.find({
                status: "active",

                stock: {
                    $gt: 0
                },

                $expr: {
                    $lte: [
                        "$stock",
                        "$lowStockThreshold"
                    ]
                }
            })
            .populate(
                "category",
                "name"
            )
            .sort({
                stock: 1
            })
            .limit(10);


        // =========================================
        // OUT OF STOCK PRODUCTS
        // =========================================

        const outOfStockProductList =
            await Product.find({
                status: "active",
                stock: 0
            })
            .populate(
                "category",
                "name"
            )
            .sort({
                updatedAt: -1
            })
            .limit(10);


        // =========================================
        // RECENT INVENTORY TRANSACTIONS
        // =========================================

        const recentInventory =
            await InventoryTransaction.find()
                .populate(
                    "product",
                    "name"
                )
                .populate(
                    "performedBy",
                    "name role"
                )
                .sort({
                    createdAt: -1
                })
                .limit(10);


        // =========================================
        // RESPONSE
        // =========================================

        res.status(200).json({

            success: true,

            data: {

                products: {
                    total: totalProducts,
                    active: activeProducts,
                    inactive: inactiveProducts,
                    outOfStock: outOfStockProducts,
                    lowStock: lowStockProducts
                },

                categories: {
                    total: totalCategories,
                    active: activeCategories
                },

                suppliers: {
                    total: totalSuppliers,
                    active: activeSuppliers
                },

                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                },

                sales: {
                    total: totalSales
                },

                recentOrders,

                lowStockProducts:
                    lowStockProductList,

                outOfStockProducts:
                    outOfStockProductList,

                recentInventory
            }
        });
    }
);


module.exports = {
    getDashboard
};