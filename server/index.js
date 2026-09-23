const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const database = require('./config/database');
const cookieParser = require("cookie-parser");
const scheduler = require('./utils/scheduler');

const port = process.env.PORT || 4000;

// Middleware
app.use(cookieParser());
app.use(express.json()); 

// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5175",
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Connecting to database
database.connectDB();

// Initialize scheduled tasks (birthdays, anniversaries, missed checkouts)
scheduler.init();

// Routes
const userRoutes = require("./routes/user");
const employeeRoutes = require("./routes/employee");
const attendanceRoutes = require("./routes/attendance");
const leaveRoutes = require("./routes/leave");
const payrollRoutes = require("./routes/payroll");
const notificationRoutes = require("./routes/notifications");

// API Routes
app.use("/api/auth", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is running" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
