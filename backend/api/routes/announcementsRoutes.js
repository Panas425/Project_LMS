const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");

// Optional auth middleware
const isTeacher = (req, res, next) => {
  // implement your auth logic
  next();
};

// Routes
router.post("/", isTeacher, announcementController.createAnnouncement);
router.get("/teacher/:teacherId", announcementController.getRecentAnnouncementsForTeacher);
router.get("/", announcementController.getAllAnnouncements);
router.get("/getRecents", announcementController.getRecentAnnouncements);
router.get("/course/:courseId", announcementController.getAnnouncementsForCourse);
router.delete("/:id", isTeacher, announcementController.deleteAnnouncement);

module.exports = router;
