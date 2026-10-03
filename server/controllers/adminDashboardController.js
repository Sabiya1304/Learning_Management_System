const User = require("../models/User");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Enrollment = require("../models/Enrollment");

// Admin Dashboard
const getAdminDashboard = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({
            role: "student"
        });

        const totalCourses = await Course.countDocuments();

        const totalAssignments = await Assignment.countDocuments();

        const totalSubmissions = await Submission.countDocuments();

        const evaluatedSubmissions = await Submission.countDocuments({
            status: "Evaluated"
        });

        const pendingSubmissions = await Submission.countDocuments({
            status: { $in: ["Submitted", "Late"] }
        });

        const totalEnrollments = await Enrollment.countDocuments();

        const courses = await Course.find()
            .populate("instructor", "name email")
            .sort({ createdAt: -1 });

        const recentSubmissions = await Submission.find()
            .populate("student", "name email")
            .populate({
                path: "assignment",
                select: "title maximumMarks course",
                populate: {
                    path: "course",
                    select: "title"
                }
            })
            .sort({ submissionDate: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            dashboard: {
                statistics: {
                    totalStudents,
                    totalCourses,
                    totalAssignments,
                    totalSubmissions,
                    evaluatedSubmissions,
                    pendingSubmissions,
                    totalEnrollments
                },
                courses,
                recentSubmissions
            }
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
    getAdminDashboard
};