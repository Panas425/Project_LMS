const express = require("express");
const router = express.Router();
const { addActivity, getActivities, uploadActivityDocument, deleteActivity } = require("../controllers/activityController");

router.post("/:courseId/modules/:moduleId", addActivity);
router.post("/:activityId/documents", uploadActivityDocument);

router.get("/:courseId/modules/:moduleId", getActivities);

router.delete("/:courseId/modules/:moduleId/activities/:activityId", deleteActivity);

module.exports = router;
