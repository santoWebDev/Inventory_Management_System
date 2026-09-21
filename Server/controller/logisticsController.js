const mongoose = require("mongoose");
const Logistics = require("../model/logistics");
const Order = require("../model/order");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const allowedStatuses = ["pending", "shipped", "in_transit", "delivered", "cancelled"];

const validateObjectId = (id, label, next) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new AppError(`Invalid ${label} ID`, 400));
    return false;
  }
  return true;
};

const createLogistics = asyncHandler(async (req, res, next) => {
  const {
    orderId,
    carrier = "",
    trackingNumber = "",
    shippingAddress = "",
    status = "pending",
    estimatedDelivery = null,
  } = req.body;

  if (!validateObjectId(orderId, "order", next)) return;
  if (!allowedStatuses.includes(status)) {
    return next(new AppError("Invalid logistics status", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new AppError("Order not found", 404));

  const existing = await Logistics.findOne({ order: order._id });
  if (existing) {
    return next(new AppError("Logistics record already exists for this order", 409));
  }

  const logistics = await Logistics.create({
    order: order._id,
    carrier: String(carrier).trim(),
    trackingNumber: String(trackingNumber).trim(),
    shippingAddress: String(shippingAddress).trim(),
    status,
    estimatedDelivery: estimatedDelivery || null,
    shippedAt: status === "shipped" || status === "in_transit" ? new Date() : null,
    deliveredAt: status === "delivered" ? new Date() : null,
  });

  const populated = await logistics.populate("order", "orderNumber totalAmount status");

  res.status(201).json({
    success: true,
    message: "Logistics record created",
    data: populated,
  });
});

const getLogistics = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const rows = await Logistics.find(filter)
    .populate("order", "orderNumber totalAmount status")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: rows });
});

const getLogisticsById = asyncHandler(async (req, res, next) => {
  if (!validateObjectId(req.params.id, "logistics", next)) return;

  const row = await Logistics.findById(req.params.id).populate(
    "order",
    "orderNumber totalAmount status"
  );

  if (!row) return next(new AppError("Logistics record not found", 404));
  res.status(200).json({ success: true, data: row });
});

const updateLogistics = asyncHandler(async (req, res, next) => {
  if (!validateObjectId(req.params.id, "logistics", next)) return;

  const row = await Logistics.findById(req.params.id);
  if (!row) return next(new AppError("Logistics record not found", 404));

  const { carrier, trackingNumber, shippingAddress, status, estimatedDelivery } = req.body;

  if (carrier !== undefined) row.carrier = String(carrier).trim();
  if (trackingNumber !== undefined) row.trackingNumber = String(trackingNumber).trim();
  if (shippingAddress !== undefined) row.shippingAddress = String(shippingAddress).trim();
  if (estimatedDelivery !== undefined) row.estimatedDelivery = estimatedDelivery || null;

  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      return next(new AppError("Invalid logistics status", 400));
    }
    row.status = status;
    if (["shipped", "in_transit"].includes(status) && !row.shippedAt) row.shippedAt = new Date();
    if (status === "delivered" && !row.deliveredAt) row.deliveredAt = new Date();
  }

  await row.save();
  const populated = await row.populate("order", "orderNumber totalAmount status");

  res.status(200).json({
    success: true,
    message: "Logistics record updated",
    data: populated,
  });
});

module.exports = {
  createLogistics,
  getLogistics,
  getLogisticsById,
  updateLogistics,
};
