const express = require("express");

const {
    getMySubmissions,
    getAssignmentSubmissions,
    getAllSubmissions,
    evaluateSubmission
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Admin view all submissions
router.get(
    "/",
    protect,
    allowRoles("admin"),
    getAllSubmissions
);


// Student view own submissions
router.get(
    "/my",
    protect,
    allowRoles("student"),
    getMySubmissions
);


// Admin view submissions of one assignment
router.get(
    "/assignment/:assignmentId",
    protect,
    allowRoles("admin"),
    getAssignmentSubmissions
);


// Admin evaluate submission
router.put(
    "/:submissionId/evaluate",
    protect,
    allowRoles("admin"),
    evaluateSubmission
);


module.exports = router;