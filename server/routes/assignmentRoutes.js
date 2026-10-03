const express = require("express");

const {
    createAssignment,
    getCourseAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
} = require("../controllers/assignmentController");

const {
    submitAssignment,
    getAssignmentSubmissions
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/course/:courseId",
    protect,
    allowRoles("admin"),
    createAssignment
);


router.get(
    "/course/:courseId",
    protect,
    getCourseAssignments
);

router.get(
    "/:id",
    protect,
    getAssignmentById
);

router.put(
    "/:id",
    protect,
    allowRoles("admin"),
    updateAssignment
);

router.delete(
    "/:id",
    protect,
    allowRoles("admin"),
    deleteAssignment
);

// Student submit assignment
router.post(
    "/:assignmentId/submit",
    protect,
    allowRoles("student"),
    submitAssignment
);

// Admin view submissions
router.get(
    "/:assignmentId/submissions",
    protect,
    allowRoles("admin"),
    getAssignmentSubmissions
);

module.exports = router;