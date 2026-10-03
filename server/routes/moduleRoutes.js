const express = require("express");

const {
    createModule,
    getCourseModules,
    updateModule,
    deleteModule
} = require("../controllers/moduleController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get modules
router.get(
    "/course/:courseId",
    protect,
    getCourseModules
);

// Create module
router.post(
    "/course/:courseId",
    protect,
    allowRoles("admin"),
    createModule
);

// Update module
router.put(
    "/:id",
    protect,
    allowRoles("admin"),
    updateModule
);

// Delete module
router.delete(
    "/:id",
    protect,
    allowRoles("admin"),
    deleteModule
);

module.exports = router;