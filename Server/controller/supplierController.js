const Supplier = require("../model/supplier");
const Product = require("../model/product");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");


// CREATE SUPPLIER
const createSupplier = asyncHandler(
    async (req, res, next) => {

        const {
            name,
            email,
            number
        } = req.body;

        if (!name || !email || !number) {
            return next(
                new AppError(
                    "Name, email and phone number are required",
                    400
                )
            );
        }

        const existingSupplier =
            await Supplier.findOne({
                $or: [
                    {
                        name: {
                            $regex: `^${name.trim()}$`,
                            $options: "i"
                        }
                    },
                    {
                        email: email.toLowerCase()
                    },
                    {
                        number: String(number)
                    }
                ]
            });

        if (existingSupplier) {
            return next(
                new AppError(
                    "Supplier already exists",
                    409
                )
            );
        }

        const supplier =
            await Supplier.create({
                name: name.trim(),
                email: email.toLowerCase(),
                number: String(number)
            });

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier
        });
    }
);


// GET SUPPLIERS
const getSupplier = asyncHandler(
    async (req, res) => {

        const {
            search,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (search) {

            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    number: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const pageNumber =
            Math.max(Number(page), 1);

        const limitNumber =
            Math.min(
                Math.max(Number(limit), 1),
                100
            );

        const skip =
            (pageNumber - 1) * limitNumber;

        const [
            suppliers,
            total
        ] = await Promise.all([

            Supplier.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Supplier.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: suppliers.length,
            total,
            page: pageNumber,
            pages: Math.ceil(
                total / limitNumber
            ),
            data: suppliers
        });
    }
);


// GET BY ID
const getSupplierById =
    asyncHandler(async (req, res, next) => {

        const supplier =
            await Supplier.findById(req.params.id);

        if (!supplier) {
            return next(
                new AppError(
                    "Supplier not found",
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            data: supplier
        });
    });


// UPDATE
const updateSupplier =
    asyncHandler(async (req, res, next) => {

        const supplier =
            await Supplier.findById(req.params.id);

        if (!supplier) {
            return next(
                new AppError(
                    "Supplier not found",
                    404
                )
            );
        }

        const {
            name,
            email,
            number,
            status
        } = req.body;

        if (name !== undefined) {

            const existing =
                await Supplier.findOne({
                    name: {
                        $regex: `^${name.trim()}$`,
                        $options: "i"
                    },
                    _id: {
                        $ne: supplier._id
                    }
                });

            if (existing) {
                return next(
                    new AppError(
                        "Supplier name already exists",
                        409
                    )
                );
            }

            supplier.name = name.trim();
        }

        if (email !== undefined) {

            const existing =
                await Supplier.findOne({
                    email: email.toLowerCase(),
                    _id: {
                        $ne: supplier._id
                    }
                });

            if (existing) {
                return next(
                    new AppError(
                        "Supplier email already exists",
                        409
                    )
                );
            }

            supplier.email =
                email.toLowerCase();
        }

        if (number !== undefined) {

            const existing =
                await Supplier.findOne({
                    number: String(number),
                    _id: {
                        $ne: supplier._id
                    }
                });

            if (existing) {
                return next(
                    new AppError(
                        "Supplier number already exists",
                        409
                    )
                );
            }

            supplier.number =
                String(number);
        }

        if (status !== undefined) {

            if (
                !["active", "inactive"]
                    .includes(status)
            ) {
                return next(
                    new AppError(
                        "Invalid supplier status",
                        400
                    )
                );
            }

            supplier.status = status;
        }

        await supplier.save();

        res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier
        });
    });


// DELETE / DEACTIVATE
const deleteSupplier =
    asyncHandler(async (req, res, next) => {

        const supplier =
            await Supplier.findById(req.params.id);

        if (!supplier) {
            return next(
                new AppError(
                    "Supplier not found",
                    404
                )
            );
        }

        const productCount =
            await Product.countDocuments({
                supplier: supplier._id
            });

        if (productCount > 0) {

            supplier.status = "inactive";

            await supplier.save();

            return res.status(200).json({
                success: true,
                message:
                    "Supplier has products, so it was marked inactive",
                data: supplier
            });
        }

        // FIXED:
        // supplier.deleteOne()
        await supplier.deleteOne();

        res.status(200).json({
            success: true,
            message: "Supplier deleted successfully"
        });
    });


module.exports = {
    createSupplier,
    getSupplier,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};