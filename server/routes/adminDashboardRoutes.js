const express = require("express");

const {
    getAdminDashboard
} = require("../controllers/adminDashboardController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    allowRoles("admin"),
    getAdminDashboard
);

module.exports = router;