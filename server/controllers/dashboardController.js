const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

// Student Dashboard
const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user.userId;

        const student = await User.findById(studentId).select(
            "name email role"
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const enrollments = await Enrollment.find({
            student: studentId
        })
            .populate("course")
            .sort({ enrollmentDate: -1 });

        const submissions = await Submission.find({
            student: studentId
        })
            .populate({
                path: "assignment",
                populate: {
                    path: "course",
                    select: "title"
                }
            })
            .sort({ submissionDate: -1 });

        const totalCourses = enrollments.length;

        const completedCourses = enrollments.filter(
            enrollment => enrollment.status === "Completed"
        ).length;

        const inProgressCourses = enrollments.filter(
            enrollment => enrollment.status === "In Progress"
        ).length;

        const totalAssignments = submissions.length;

        const evaluatedAssignments = submissions.filter(
            submission => submission.status === "Evaluated"
        ).length;

        res.status(200).json({
            success: true,
            dashboard: {
                student,
                statistics: {
                    totalCourses,
                    completedCourses,
                    inProgressCourses,
                    totalAssignments,
                    evaluatedAssignments
                },
                courses: enrollments,
                submissions
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
    getStudentDashboard
};