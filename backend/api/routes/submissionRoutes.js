const express = require("express");
const router = express.Router();


const multer = require("multer");
const path = require("path");

const fs = require("fs");
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

const {
  addSubmission,
  getSubmissionsForStudent,
  deleteSubmissionByStudent,
  getSubmissions,
  updateSubmissionGrade
} = require("../controllers/submissionController");

// GET all submissions for an activity
router.get(
  "/:courseId/modules/:moduleId/activities/:activityId/submissions",
  getSubmissions
);

// POST create a submission inside an activity
router.post(
  "/:courseId/modules/:moduleId/activities/:activityId/submissions",
  upload.single("file"),
  addSubmission
);

router.get("/student/:studentId", getSubmissionsForStudent);
router.delete("/student/:id", deleteSubmissionByStudent);

router.put("/:submissionId/grade", updateSubmissionGrade);


module.exports = router;
