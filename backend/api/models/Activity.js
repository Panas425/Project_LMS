const mongoose = require("mongoose");
const ActivityDocumentSchema = require("./ActivityDocument");
const SubmissionSchema = require("./Submission");

const ActivitySchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    start: { type: Date, default: null },
    end: { type: Date, required: true }, // deadline
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: false },
    activityType: {
      type: String,
      enum: ["Assignment", "Quiz", "Lecture", "Lab", "Project"],
      default: "Assignment",
    },
    documents: { type: [ActivityDocumentSchema], default: [] },
    submissions: [SubmissionSchema], default: [],
    teacherID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = ActivitySchema;
