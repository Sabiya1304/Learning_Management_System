const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: "student" })
            .select("-password")
            .sort({ createdAt: -1 });

        const studentsWithEnrollments = await Promise.all(
            students.map(async (student) => {
                const enrollments = await Enrollment.find({
                    student: student._id
                })
                    .populate("course", "title")
                    .select("course progress status enrollmentDate");

                return {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    createdAt: student.createdAt,
                    enrollments
                };
            })
        );

        res.json({
            success: true,
            count: studentsWithEnrollments.length,
            students: studentsWithEnrollments
        });

    } catch (error) {
        console.error("Get students error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students"
        });
    }
};

module.exports = {
    getAllStudents
};