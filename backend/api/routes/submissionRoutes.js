const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/authMiddleware"); // Make sure this path is correct

// Import the controller
const submissionController = require("../controllers/submissionController");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/submissions");
    
    // Create folder automatically if missing
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  }
});

const upload = multer({ storage });

// Routes
router.get(
  "/:courseId/modules/:moduleId/activities/:activityId/submissions",
  submissionController.getSubmissions
);

router.post(
  "/:courseId/modules/:moduleId/activities/:activityId/submissions",
  upload.single("file"),
  submissionController.addSubmission
);

router.get("/student/:studentId", submissionController.getSubmissionsForStudent);
router.delete("/student/:id", submissionController.deleteSubmissionByStudent);
router.put("/:submissionId/grade", submissionController.updateSubmissionGrade);
router.get('/teacher/submissions', auth.authenticateToken, submissionController.getTeacherSubmissions);

module.exports = router;