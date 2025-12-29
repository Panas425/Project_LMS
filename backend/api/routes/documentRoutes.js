const express = require("express");
const router = express.Router();
const multer = require("multer");


const {
  addDocument,
  getDocuments
} = require("../controllers/documentController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/documents"); // folder where files are stored
  },
  filename: function (req, file, cb) {
    // keep original name or add timestamp to avoid collisions
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// GET all documents for an activity
router.get(
  "/:courseId/modules/:moduleId/activities/:activityId/documents",
  getDocuments
);

// POST add a document to an activity
router.post(
  "/:courseId/modules/:moduleId/activities/:activityId/documents",
  upload.single("file"), 
  addDocument
);

module.exports = router;
