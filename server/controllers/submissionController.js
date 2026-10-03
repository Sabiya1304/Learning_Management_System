const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");

// Student submit assignment
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const {
            submissionText,
            githubLink,
            driveLink,
            projectUrl,
            fileUrl
        } = req.body;

        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.userId,
            course: assignment.course
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course"
            });
        }

        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: req.user.userId
        });

        if (existingSubmission) {
            return res.status(409).json({
                success: false,
                message: "Assignment already submitted"
            });
        }

        const status =
            new Date() > new Date(assignment.deadline)
                ? "Late"
                : "Submitted";

        const submission = await Submission.create({
            assignment: assignmentId,
            student: req.user.userId,
            submissionText: submissionText || "",
            githubLink: githubLink || "",
            driveLink: driveLink || "",
            projectUrl: projectUrl || "",
            fileUrl: fileUrl || "",
            status
        });

        res.status(201).json({
            success: true,
            message: "Assignment submitted successfully",
            submission
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Student view own submissions
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            student: req.user.userId
        })
            .populate({
                path: "assignment",
                populate: {
                    path: "course"
                }
            })
            .sort({ submissionDate: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Admin view assignment submissions
const getAssignmentSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const submissions = await Submission.find({
            assignment: req.params.assignmentId
        })
            .populate("student", "name email")
            .sort({ submissionDate: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
// Admin view all submissions
const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate("student", "name email")
            .populate({
                path: "assignment",
                select: "title maximumMarks deadline course",
                populate: {
                    path: "course",
                    select: "title"
                }
            })
            .sort({ submissionDate: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Admin evaluate submission
const evaluateSubmission = async (req, res) => {
    try {
        const { marks, feedback } = req.body;

        const submission = await Submission.findById(req.params.submissionId)
            .populate("assignment");

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        if (marks === undefined || marks === null) {
            return res.status(400).json({
                success: false,
                message: "Marks are required"
            });
        }

        if (
            marks < 0 ||
            marks > submission.assignment.maximumMarks
        ) {
            return res.status(400).json({
                success: false,
                message: `Marks must be between 0 and ${submission.assignment.maximumMarks}`
            });
        }

        submission.marks = marks;
        submission.feedback = feedback || "";
        submission.status = "Evaluated";

        await submission.save();

        res.status(200).json({
            success: true,
            message: "Submission evaluated successfully",
            submission
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    submitAssignment,
    getMySubmissions,
    getAssignmentSubmissions,
    getAllSubmissions,
    evaluateSubmission
};