const errorHandler = (err, req, res, next) => {

    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;

        const messages = Object.values(err.errors).map(
            (error) => error.message
        );

        message = messages.join(", ");
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID";
    }

    // Duplicate key
    if (err.code === 11000) {
        statusCode = 409    ;

        const field = Object.keys(err.keyPattern || {})[0];

        message = `${field || "Field"} already exists`;
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;