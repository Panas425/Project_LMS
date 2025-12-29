const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  deadline: { type: Date, default: null },
  grade: { type: String, default: null },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  activityName: { type: String, required: true },
  dueDate: { type: Date, required: true },
  submitted: { type: Boolean, default: false },
  submittedLate: { type: Boolean, default: false },
  courseId: { type: String, required: true },

});

module.exports = SubmissionSchema; 
