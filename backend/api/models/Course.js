const mongoose = require("mongoose");
const ModuleSchema = require("./Module");
const AnnouncementSchema = require("./Announcement");

const CourseSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  description: String,
  start: Date,
  end: Date,

  modules: { type: [ModuleSchema], default: [] },
  // store minimal user data
  courseUsers: {
    type: [
      {
        _id: String,
        username: String,
        email: String,
        role: { type: String, enum: ["teacher", "student"] },
        firstName: String,
        lastName: String,
        fullName: String, // computed as `${firstName} ${lastName}`
      }
    ],
    default: []
  },

  moduleId: { type: [String], default: [] },
  userId: { type: [String], default: [] },
  courseUserId: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);
