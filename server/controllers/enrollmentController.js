const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// Enroll Student in Course
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            student: req.user.userId,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(409).json({
                success: false,
                message: "Already enrolled in this course"
            });
        }

        const enrollment = await Enrollment.create({
            student: req.user.userId,
            course: courseId
        });

        res.status(201).json({
            success: true,
            message: "Course enrollment successful",
            enrollment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Get My Courses
const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.userId
        })
            .populate("course")
            .sort({ enrollmentDate: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Get Enrollment for Specific Course
const getCourseEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            student: req.user.userId,
            course: req.params.courseId
        })
            .populate("course");

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found"
            });
        }

        res.status(200).json({
            success: true,
            enrollment
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
    enrollInCourse,
    getMyCourses,
    getCourseEnrollment
};