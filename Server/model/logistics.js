const mongoose = require("mongoose");

const logisticsSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    carrier: {
      type: String,
      trim: true,
      default: "",
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },
    shippingAddress: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "in_transit", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Logistics", logisticsSchema);
