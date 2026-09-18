const mongoose = require("mongoose")

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "inactive"],
        default: "active"
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Supplier", supplierSchema)