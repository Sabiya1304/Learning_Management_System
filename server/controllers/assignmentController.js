const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Create Assignment - Admin
const createAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            instructions,
            deadline,
            maximumMarks
        } = req.body;

        if (!title || !description || !deadline || !maximumMarks) {
            return res.status(400).json({
                success: false,
                message: "Title, description, deadline and maximum marks are required"
            });
        }

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const assignment = await Assignment.create({
            course: req.params.courseId,
            title,
            description,
            instructions: instructions || "",
            deadline,
            maximumMarks
        });

        res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            assignment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Get Course Assignments
const getCourseAssignments = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const assignments = await Assignment.find({
            course: req.params.courseId
        }).sort({ deadline: 1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get Single Assignment
const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(
            req.params.id
        ).populate(
            "course",
            "title description category instructor duration difficulty image"
        );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        res.status(200).json({
            success: true,
            assignment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Update Assignment - Admin
const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const {
            title,
            description,
            instructions,
            deadline,
            maximumMarks
        } = req.body;

        if (title !== undefined) assignment.title = title;
        if (description !== undefined) assignment.description = description;
        if (instructions !== undefined) assignment.instructions = instructions;
        if (deadline !== undefined) assignment.deadline = deadline;
        if (maximumMarks !== undefined) assignment.maximumMarks = maximumMarks;

        await assignment.save();

        res.status(200).json({
            success: true,
            message: "Assignment updated successfully",
            assignment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// Delete Assignment - Admin
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        await Assignment.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Assignment deleted successfully"
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
    createAssignment,
    getCourseAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
};