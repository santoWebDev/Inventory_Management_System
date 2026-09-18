const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name required"],
        unique: true,
        trim: true,
        minLength: [2, "Product name should be more than 2 letters"]
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, "price is required"],
        min: [0, "price cannot be negative"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Category"
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Supplier"
    },
    stock: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0

    }
},
    {
        timestamps: true
    });

productSchema.index({
    category: 1,
    status: 1,
    createdAt: -1
});

module.exports = mongoose.model("Product", productSchema);