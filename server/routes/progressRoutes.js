const express = require("express");

const {
    completeModule,
    getCourseProgress
} = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/modules/:moduleId/complete",
    protect,
    allowRoles("student"),
    completeModule
);

router.get(
    "/courses/:courseId/progress",
    protect,
    allowRoles("student"),
    getCourseProgress
);

module.exports = router;