const express = require("express");

const {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getAllCourses);

router.get("/:id", getCourseById);

router.post(
    "/",
    protect,
    allowRoles("admin"),
    createCourse
);
router.put(
    "/:id",
    protect,
    allowRoles("admin"),
    updateCourse
);
router.delete(
    "/:id",
    protect,
    allowRoles("admin"),
    deleteCourse
);


module.exports = router;