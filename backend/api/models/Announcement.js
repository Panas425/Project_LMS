const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // optional
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // only track createdAt
);

module.exports = mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
