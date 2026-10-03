const Module = require("../models/Module");
const Course = require("../models/Course");

// Create Module
const createModule = async (req, res) => {
    try {
        const { title, description, notes, videoLink, resourceLink, sourceCodeLink, practiceExercise, moduleOrder } = req.body;

        if (!title || moduleOrder === undefined) {
            return res.status(400).json({
                success: false,
                message: "Title and module order are required"
            });
        }

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const module = await Module.create({
            course: req.params.courseId,
            title,
            description: description || "",
            notes: notes || "",
            videoLink: videoLink || "",
            resourceLink: resourceLink || "",
            sourceCodeLink: sourceCodeLink || "",
            practiceExercise: practiceExercise || "",
            moduleOrder
        });

        res.status(201).json({
            success: true,
            message: "Module created successfully",
            module
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get Course Modules
const getCourseModules = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const modules = await Module.find({
            course: req.params.courseId
        }).sort({ moduleOrder: 1 });

        res.status(200).json({
            success: true,
            count: modules.length,
            modules
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Update Module
const updateModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        const {
            title,
            description,
            notes,
            videoLink,
            resourceLink,
            sourceCodeLink,
            practiceExercise,
            moduleOrder
        } = req.body;

        if (title !== undefined) module.title = title;
        if (description !== undefined) module.description = description;
        if (notes !== undefined) module.notes = notes;
        if (videoLink !== undefined) module.videoLink = videoLink;
        if (resourceLink !== undefined) module.resourceLink = resourceLink;
        if (sourceCodeLink !== undefined) module.sourceCodeLink = sourceCodeLink;
        if (practiceExercise !== undefined) module.practiceExercise = practiceExercise;
        if (moduleOrder !== undefined) module.moduleOrder = moduleOrder;

        await module.save();

        res.status(200).json({
            success: true,
            message: "Module updated successfully",
            module
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Delete Module
const deleteModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        await Module.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Module deleted successfully"
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
    createModule,
    getCourseModules,
    updateModule,
    deleteModule
};