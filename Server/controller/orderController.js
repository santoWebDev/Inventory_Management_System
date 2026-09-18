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
// ORDER NUMBER
// =====================================================

const generateOrderNumber = () => {

    const timestamp =
        Date.now().toString();

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `ORD-${timestamp}-${random}`;
};


// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = asyncHandler(
    async (req, res, next) => {

        const { items } = req.body;

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return next(
                new AppError(
                    "Order must contain at least one item",
                    400
                )
            );
        }

        const session =
            await mongoose.startSession();

        try {

            let createdOrder;

            await session.withTransaction(
                async () => {

                    /*
                     * ------------------------------------------------
                     * 1. Validate request items
                     * ------------------------------------------------
                     */

                    const productIds =
                        items.map(
                            item => item.productId
                        );

                    for (
                        const productId
                        of productIds
                    ) {

                        if (
                            !mongoose.Types.ObjectId.isValid(
                                productId
                            )
                        ) {
                            throw new AppError(
                                `Invalid product ID: ${productId}`,
                                400
                            );
                        }
                    }


                    /*
                     * ------------------------------------------------
                     * 2. Prevent duplicate products
                     * ------------------------------------------------
                     */

                    const uniqueProductIds =
                        new Set(productIds);

                    if (
                        uniqueProductIds.size !==
                        productIds.length
                    ) {
                        throw new AppError(
                            "Duplicate products are not allowed in an order",
                            400
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * 3. Get products from DB
                     * ------------------------------------------------
                     */

                    const products =
                        await Product.find({
                            _id: {
                                $in: productIds
                            }
                        }).session(session);


                    if (
                        products.length !==
                        productIds.length
                    ) {
                        throw new AppError(
                            "One or more products were not found",
                            404
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * 4. Validate and calculate
                     * ------------------------------------------------
                     */

                    const orderItems = [];

                    let totalAmount = 0;


                    for (
                        const item
                        of items
                    ) {

                        if (
                            !Number.isInteger(
                                item.quantity
                            ) ||
                            item.quantity <= 0
                        ) {
                            throw new AppError(
                                "Quantity must be a positive integer",
                                400
                            );
                        }


                        const product =
                            products.find(
                                product =>
                                    product._id.toString() ===
                                    item.productId
                            );


                        if (!product) {
                            throw new AppError(
                                "Product not found",
                                404
                            );
                        }


                        if (
                            product.status !==
                            "active"
                        ) {
                            throw new AppError(
                                `${product.name} is inactive`,
                                400
                            );
                        }


                        if (
                            product.stock <
                            item.quantity
                        ) {
                            throw new AppError(
                                `Insufficient stock for ${product.name}`,
                                400
                            );
                        }


                        /*
                         * IMPORTANT:
                         * Price comes from database.
                         */

                        const price =
                            product.price;

                        const subtotal =
                            price *
                            item.quantity;

                        totalAmount +=
                            subtotal;


                        orderItems.push({
                            product:
                                product._id,

                            name:
                                product.name,

                            price,

                            quantity:
                                item.quantity,

                            subtotal
                        });
                    }


                    /*
                     * ------------------------------------------------
                     * 5. Reduce stock
                     * ------------------------------------------------
                     */

                    const inventoryTransactions =
                        [];


                    for (
                        const orderItem
                        of orderItems
                    ) {

                        const product =
                            await Product.findOneAndUpdate(
                                {
                                    _id:
                                        orderItem.product,

                                    stock: {
                                        $gte:
                                            orderItem.quantity
                                    }
                                },
                                {
                                    $inc: {
                                        stock:
                                            -orderItem.quantity
                                    }
                                },
                                {
                                    new: true,
                                    session
                                }
                            );


                        if (!product) {
                            throw new AppError(
                                `Insufficient stock for ${orderItem.name}`,
                                400
                            );
                        }


                        inventoryTransactions.push({
                            product:
                                orderItem.product,

                            quantity:
                                orderItem.quantity,

                            type:
                                "OUT",

                            previousStock:
                                product.stock +
                                orderItem.quantity,

                            newStock:
                                product.stock,

                            reason:
                                "Order purchase",

                            referenceType:
                                "ORDER",

                            performedBy:
                                req.user._id
                        });
                    }


                    /*
                     * ------------------------------------------------
                     * 6. Create Order
                     * ------------------------------------------------
                     */

                    const [order] =
                        await Order.create(
                            [
                                {
                                    orderNumber:
                                        generateOrderNumber(),

                                    user:
                                        req.user._id,

                                    items:
                                        orderItems,

                                    totalAmount,

                                    status:
                                        "confirmed"
                                }
                            ],
                            {
                                session
                                
                            }
                        );


                    /*
                     * ------------------------------------------------
                     * 7. Link inventory history to order
                     * ------------------------------------------------
                     */

                    for (
                        const transaction
                        of inventoryTransactions
                    ) {

                        transaction.referenceId =
                            order._id;
                    }


                    await InventoryTransaction.create(
                        inventoryTransactions,
                        {
                            session,
                            ordered: true
                        }
                    );


                    createdOrder =
                        order;
                }
            );


            const populatedOrder =
                await Order.findById(
                    createdOrder._id
                )
                .populate(
                    "user",
                    "name email role"
                )
                .populate(
                    "items.product",
                    "name price"
                );


            res.status(201).json({
                success: true,
                message:
                    "Order created successfully",
                data: populatedOrder
            });


        } finally {

            await session.endSession();
        }
    }
);


// =====================================================
// GET ALL ORDERS
// =====================================================

const getOrders = asyncHandler(
    async (req, res) => {

        const {
            status,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        const pageNumber =
            Math.max(
                Number(page),
                1
            );

        const limitNumber =
            Math.min(
                Math.max(
                    Number(limit),
                    1
                ),
                100
            );

        const skip =
            (pageNumber - 1) *
            limitNumber;


        const [
            orders,
            total
        ] = await Promise.all([

            Order.find(filter)
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limitNumber),

            Order.countDocuments(filter)
        ]);


        res.status(200).json({
            success: true,
            count:
                orders.length,
            total,
            page:
                pageNumber,
            pages:
                Math.ceil(
                    total /
                    limitNumber
                ),
            data:
                orders
        });
    }
);


// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = asyncHandler(
    async (req, res) => {

        const orders =
            await Order.find({
                user:
                    req.user._id
            })
            .sort({
                createdAt: -1
            });


        res.status(200).json({
            success: true,
            count:
                orders.length,
            data:
                orders
        });
    }
);


// =====================================================
// GET ORDER BY ID
// =====================================================

const getOrderById =
    asyncHandler(
        async (req, res, next) => {

            const order =
                await Order.findById(
                    req.params.id
                )
                .populate(
                    "user",
                    "name email role"
                )
                .populate(
                    "items.product",
                    "name price category supplier"
                );


            if (!order) {
                return next(
                    new AppError(
                        "Order not found",
                        404
                    )
                );
            }


            /*
             * Employee/user can only see own order.
             * Admin can see all.
             */

            if (
                req.user.role !== "admin" &&
                order.user._id.toString() !==
                req.user._id.toString()
            ) {
                return next(
                    new AppError(
                        "You are not authorized to view this order",
                        403
                    )
                );
            }


            res.status(200).json({
                success: true,
                data:
                    order
            });
        }
    );


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus =
    asyncHandler(
        async (req, res, next) => {

            const {
                status
            } = req.body;


            const allowedStatuses = [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {
                return next(
                    new AppError(
                        "Invalid order status",
                        400
                    )
                );
            }


            const order =
                await Order.findById(
                    req.params.id
                );


            if (!order) {
                return next(
                    new AppError(
                        "Order not found",
                        404
                    )
                );
            }


            if (
                order.status ===
                "cancelled"
            ) {
                return next(
                    new AppError(
                        "Cancelled order cannot be updated",
                        400
                    )
                );
            }


            if (
                order.status ===
                "delivered"
            ) {
                return next(
                    new AppError(
                        "Delivered order cannot be updated",
                        400
                    )
                );
            }


            order.status =
                status;


            await order.save();


            res.status(200).json({
                success: true,
                message:
                    "Order status updated successfully",
                data:
                    order
            });
        }
    );


// =====================================================
// CANCEL ORDER
// =====================================================

const cancelOrder =
    asyncHandler(
        async (req, res, next) => {

            const {
                reason
            } = req.body;


            const session =
                await mongoose.startSession();


            try {

                let cancelledOrder;


                await session.withTransaction(
                    async () => {

                        const order =
                            await Order.findById(
                                req.params.id
                            )
                            .session(session);


                        if (!order) {
                            throw new AppError(
                                "Order not found",
                                404
                            );
                        }


                        if (
                            req.user.role !==
                            "admin" &&
                            order.user.toString() !==
                            req.user._id.toString()
                        ) {
                            throw new AppError(
                                "You are not authorized to cancel this order",
                                403
                            );
                        }


                        if (
                            order.status ===
                            "cancelled"
                        ) {
                            throw new AppError(
                                "Order is already cancelled",
                                400
                            );
                        }


                        if (
                            [
                                "shipped",
                                "delivered"
                            ].includes(
                                order.status
                            )
                        ) {
                            throw new AppError(
                                "Shipped or delivered orders cannot be cancelled",
                                400
                            );
                        }


                        /*
                         * Restore stock
                         */

                        for (
                            const item
                            of order.items
                        ) {

                            const product =
                                await Product.findByIdAndUpdate(
                                    item.product,
                                    {
                                        $inc: {
                                            stock:
                                                item.quantity
                                        }
                                    },
                                    {
                                        new: true,
                                        session
                                    }
                                );


                            if (!product) {
                                throw new AppError(
                                    `Product ${item.name} not found`,
                                    404
                                );
                            }


                            await InventoryTransaction.create(
                                [
                                    {
                                        product:
                                            item.product,

                                        quantity:
                                            item.quantity,

                                        type:
                                            "IN",

                                        previousStock:
                                            product.stock -
                                            item.quantity,

                                        newStock:
                                            product.stock,

                                        reason:
                                            `Order ${order.orderNumber} cancelled`,

                                        referenceId:
                                            order._id,

                                        referenceType:
                                            "ORDER",

                                        performedBy:
                                            req.user._id
                                    }
                                ],
                                {
                                    session
                                }
                            );
                        }


                        order.status =
                            "cancelled";

                        order.cancelledAt =
                            new Date();

                        order.cancelReason =
                            reason ||
                            "Order cancelled";


                        await order.save({
                            session
                        });


                        cancelledOrder =
                            order;
                    }
                );


                res.status(200).json({
                    success: true,
                    message:
                        "Order cancelled and stock restored",
                    data:
                        cancelledOrder
                });


            } finally {

                await session.endSession();
            }
        }
    );


module.exports = {
    createOrder,
    getOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};