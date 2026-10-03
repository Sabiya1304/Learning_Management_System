const Course = require("../models/Course");

// Create Course
const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            duration,
            difficulty,
            image
        } = req.body;

        if (
            !title ||
            !description ||
            !category ||
            !duration ||
            !difficulty
        ) {
            return res.status(400).json({
                success: false,
                message: "All required course fields are needed"
            });
        }

        const course = await Course.create({
            title,
            description,
            category,
            instructor: req.user.userId,
            duration,
            difficulty,
            image: image || ""
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Get All Courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("instructor", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Get Single Course
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("instructor", "name email");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        res.status(200).json({
            success: true,
            course
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Update Course
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const {
            title,
            description,
            category,
            duration,
            difficulty,
            image
        } = req.body;

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.duration = duration || course.duration;
        course.difficulty = difficulty || course.difficulty;
        course.image = image ?? course.image;

        await course.save();

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
// Delete Course
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
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
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};