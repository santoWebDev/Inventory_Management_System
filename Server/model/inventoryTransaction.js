const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"]
        },

        type: {
            type: String,
            enum: [
                "IN",
                "OUT",
                "ADJUSTMENT"
            ],
            required: true,
            index: true
        },

        previousStock: {
            type: Number,
            required: true,
            min: 0
        },

        newStock: {
            type: Number,
            required: true,
            min: 0
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        referenceType: {
            type: String,
            enum: [
                "MANUAL",
                "ORDER"
            ],
            default: "MANUAL"
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

inventoryTransactionSchema.index({
    product: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "InventoryTransaction",
    inventoryTransactionSchema
);