const express = require("express");

const {
    enrollInCourse,
    getMyCourses,
    getCourseEnrollment
} = require("../controllers/enrollmentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Enroll in a course
router.post(
    "/",
    protect,
    allowRoles("student"),
    enrollInCourse
);

// Get student's enrolled courses
router.get(
    "/my-courses",
    protect,
    allowRoles("student"),
    getMyCourses
);

// Get enrollment for a specific course
router.get(
    "/:courseId",
    protect,
    allowRoles("student"),
    getCourseEnrollment
);

module.exports = router;