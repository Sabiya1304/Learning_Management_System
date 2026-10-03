require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const existingAdmin = await User.findOne({
            email: "admin@lms.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        const admin = await User.create({
            name: "LMS Admin",
            email: "admin@lms.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully");
        console.log("Email:", admin.email);

        process.exit(0);

    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();