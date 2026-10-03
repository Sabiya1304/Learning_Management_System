const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        notes: {
            type: String,
            default: ""
        },

        videoLink: {
            type: String,
            default: ""
        },

        resourceLink: {
            type: String,
            default: ""
        },

        sourceCodeLink: {
            type: String,
            default: ""
        },

        practiceExercise: {
            type: String,
            default: ""
        },

        moduleOrder: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

moduleSchema.index(
    { course: 1, moduleOrder: 1 },
    { unique: true }
);

module.exports = mongoose.model("Module", moduleSchema);