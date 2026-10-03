const Module = require("../models/Module");
const ModuleProgress = require("../models/ModuleProgress");
const Enrollment = require("../models/Enrollment");

// Complete a module
const completeModule = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const module = await Module.findById(moduleId);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.userId,
            course: module.course
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course"
            });
        }

        let progress = await ModuleProgress.findOne({
            student: req.user.userId,
            module: moduleId
        });

        if (!progress) {
            progress = await ModuleProgress.create({
                student: req.user.userId,
                course: module.course,
                module: moduleId,
                completed: true,
                completedAt: new Date()
            });
        } else {
            progress.completed = true;
            progress.completedAt = new Date();
            await progress.save();
        }

        const totalModules = await Module.countDocuments({
            course: module.course
        });

        const completedModuleRecords = await ModuleProgress.find({
            student: req.user.userId,
            course: courseId,
            completed: true
        }).select("module");

        const completedModules = completedModuleRecords.length;

        const completedModuleIds = completedModuleRecords.map(
            (record) => record.module.toString()
        );

        const percentage = Math.round(
            (completedModules / totalModules) * 100
        );

        enrollment.progress = percentage;
        enrollment.status =
            percentage === 100 ? "Completed" : "In Progress";

        await enrollment.save();

        res.status(200).json({
            success: true,
            message: "Module completed successfully",
            progress: {
                completedModules,
                totalModules,
                percentage,
                status: enrollment.status
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


const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            student: req.user.userId,
            course: courseId
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course"
            });
        }

        const totalModules = await Module.countDocuments({
            course: courseId
        });

        const completedModuleRecords = await ModuleProgress.find({
            student: req.user.userId,
            course: courseId,
            completed: true
        }).select("module");

        const completedModules =
            completedModuleRecords.length;

        const completedModuleIds =
            completedModuleRecords.map(
                (record) => record.module.toString()
            );

        const percentage =
            totalModules === 0
                ? 0
                : Math.round(
                    (completedModules / totalModules) * 100
                );

        const status =
            percentage === 100
                ? "Completed"
                : percentage > 0
                    ? "In Progress"
                    : "Not Started";

        res.status(200).json({
            success: true,
            courseId,
            completedModules,
            totalModules,
            percentage,
            status,
            completedModuleIds
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
    completeModule,
    getCourseProgress
};