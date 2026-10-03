const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const progressRoutes = require("./routes/progressRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const studentRoutes = require("./routes/studentRoutes");


const protect = require("./middleware/authMiddleware");
const allowRoles = require("./middleware/roleMiddleware");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard/admin", adminDashboardRoutes);
app.use("/api/students", studentRoutes);



app.get(
    "/api/test/student",
    protect,
    allowRoles("student"),
    (req, res) => {
        res.json({
            success: true,
            message: "Student access granted",
            user: req.user
        });
    }
);

app.get(
    "/api/test/admin",
    protect,
    allowRoles("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted"
        });
    }
);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LMS API is running"
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});