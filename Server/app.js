// const express = require("express");
// const connectDB = require("./config/database");
// const userRoutes = require("./routes/userRoute");
// const productRoutes = require("./routes/productRoute");
// const categoryRoutes = require("./routes/categoryRoute");
// const supplierRoutes = require("./routes/supplierRoute");
// const inventoryRoutes = require('./routes/inventoryRoute')
// const orderRoutes = require("./routes/orderRoute");
// const dashboardRoutes = require("./routes/dashboardRoute");
// const reportRoutes = require("./routes/reportRoute");

// const errorHandler = require('./middlewares/errorMiddleware');
// require('dotenv').config();

// app.use(
//     cors({origin: true, credentials: true })
// );

// const app = express();
// const startServer = async () => {
//     try {

//         await connectDB();

//         app.listen(process.env.PORT || 5000, () => {
//             console.log(
//                 `Server is running on Port ${process.env.PORT || 5000}`
//             );
//         });

//     } catch (error) {

//         console.error("Failed to start server:", error.message);

//     }
// };

// startServer();

// app.use(express.json());

// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use('/api/category', categoryRoutes)
// app.use('/api/suppliers', supplierRoutes)
// app.use('/api/inventory', inventoryRoutes)
// app.use("/api/orders", orderRoutes);
// app.use( "/api/dashboard", dashboardRoutes);
// app.use( "/api/reports", reportRoutes);




// app.get("/", (req, res) => {
//     res.send("Inventory API running...")
// });

// app.use(errorHandler);


const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const errorHandler = require("./middlewares/errorMiddleware");

const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const supplierRoutes = require("./routes/supplierRoute");
const inventoryRoutes = require("./routes/inventoryRoute");
const orderRoutes = require("./routes/orderRoute");
const dashboardRoutes = require("./routes/dashboardRoute");
const reportRoutes = require("./routes/reportRoute");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Inventory API running" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;


