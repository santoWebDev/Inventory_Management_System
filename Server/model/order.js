const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);


const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            index: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message:
                    "Order must contain at least one item"
            }
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending",
            index: true
        },

        cancelledAt: {
            type: Date,
            default: null
        },

        cancelReason: {
            type: String,
            default: null,
            trim: true
        }
    },
    {
        timestamps: true
    }
);


orderSchema.index({
    user: 1,
    createdAt: -1
});


orderSchema.index({
    status: 1,
    createdAt: -1
});


module.exports = mongoose.model(
    "Order",
    orderSchema
);