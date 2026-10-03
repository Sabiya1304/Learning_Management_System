const express = require("express");

const {
    getAllStudents
} = require("../controllers/studentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    allowRoles("admin"),
    getAllStudents
);

module.exports = router;