const Customer = require("../model/customer");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const createCustomer = asyncHandler(async (req, res, next) => {
  const { name, email, phone = "", address = "", status = "active" } = req.body;

  if (!name || !email) {
    return next(new AppError("Name and email are required", 400));
  }

  if (!["active", "inactive"].includes(status)) {
    return next(new AppError("Invalid customer status", 400));
  }

  const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return next(new AppError("Customer email already exists", 409));
  }

  const customer = await Customer.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: String(phone).trim(),
    address: String(address).trim(),
    status,
  });

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
});

const getCustomers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    Customer.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: customers.length,
    total,
    page: pageNumber,
    pages: Math.max(Math.ceil(total / limitNumber), 1),
    data: customers,
  });
});

const getCustomerById = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return next(new AppError("Customer not found", 404));
  res.status(200).json({ success: true, data: customer });
});

const updateCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return next(new AppError("Customer not found", 404));

  const { name, email, phone, address, status } = req.body;

  if (name !== undefined) customer.name = String(name).trim();
  if (phone !== undefined) customer.phone = String(phone).trim();
  if (address !== undefined) customer.address = String(address).trim();

  if (status !== undefined) {
    if (!["active", "inactive"].includes(status)) {
      return next(new AppError("Invalid customer status", 400));
    }
    customer.status = status;
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await Customer.findOne({
      email: normalizedEmail,
      _id: { $ne: customer._id },
    });
    if (existing) return next(new AppError("Customer email already exists", 409));
    customer.email = normalizedEmail;
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
});

const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return next(new AppError("Customer not found", 404));

  customer.status = "inactive";
  await customer.save();

  res.status(200).json({
    success: true,
    message: "Customer deactivated",
    data: customer,
  });
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
