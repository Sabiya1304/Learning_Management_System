const express = require("express");

const {
    getStudentDashboard
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/student",
    protect,
    allowRoles("student"),
    getStudentDashboard
);

module.exports = router;