const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        submissionText: {
            type: String,
            default: ""
        },

        githubLink: {
            type: String,
            default: ""
        },

        driveLink: {
            type: String,
            default: ""
        },

        projectUrl: {
            type: String,
            default: ""
        },

        fileUrl: {
            type: String,
            default: ""
        },

        submissionDate: {
            type: Date,
            default: Date.now
        },

        marks: {
            type: Number,
            default: null
        },

        feedback: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Submitted", "Evaluated", "Late"],
            default: "Submitted"
        }
    },
    {
        timestamps: true
    }
);

submissionSchema.index(
    { assignment: 1, student: 1 },
    { unique: true }
);

module.exports = mongoose.model("Submission", submissionSchema);