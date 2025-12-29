const Announcement = require("../models/Announcement");

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, courseId, authorId } = req.body;

    if (!title || !message || !authorId) {
      return res.status(400).json({ error: "Title, message, and authorId are required" });
    }

    const announcement = new Announcement({ title, message, courseId, authorId });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get top 3 recent announcements for a teacher
exports.getRecentAnnouncementsForTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const announcements = await Announcement.find({ authorId: teacherId })
      .sort({ createdAt: -1 })
      .limit(3);
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all announcements for a course
exports.getAnnouncementsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const announcements = await Announcement.find({ courseId })
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Directly delete using findByIdAndDelete
    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(3); // top 3
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getRecentAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: "courseId", select: "name" }); // get only course name

    // Map to include courseName for frontend
    const formatted = announcements.map(a => ({
      _id: a._id,
      title: a.title,
      message: a.message,
      courseName: a.courseId ? a.courseId.name : null, // optional
      createdAt: a.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

