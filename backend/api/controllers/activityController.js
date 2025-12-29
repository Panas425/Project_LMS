const Course = require("../models/Course");
const mongoose = require("mongoose");

// Add new activity to a module
exports.addActivity = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const course = await Course.findOne({
      _id: courseId,
      "modules._id": moduleId
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = course.modules.find(m => m._id.toString() === moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    console.log("module id", moduleId)
    const newActivity = {
      name: req.body.name,
      description: req.body.description,
      start: req.body.start ? new Date(req.body.start) : null,
      end: req.body.end ? new Date(req.body.end) : null,
      activityType: req.body.activityType || "Assignment",
      documents: [],
      submissions: []
    };


    module.activities.push(newActivity);
    await course.save();

    const addedActivity = module.activities[module.activities.length - 1];
    res.json({ message: "Activity added", activity: addedActivity });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding activity", error: err.message });
  }
};

// Get all activities for a module
exports.getActivities = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const course = await Course.findById(courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const module = course.modules.find(m => m._id.toString() === moduleId);
    if (!module)
      return res.status(404).json({ message: "Module not found" });

    res.json(module.activities || []);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching activities", error: err.message });
  }
};

// Get a single activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const { courseId, moduleId, activityId } = req.params;
    const course = await Course.findById(courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const module = course.modules.find(m => m._id.toString() === moduleId);
    if (!module)
      return res.status(404).json({ message: "Module not found" });

    const activity = module.activities.find(a => a._id.toString() === activityId);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    res.json(activity);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching activity", error: err.message });
  }
};

// Upload a document for an activity
exports.uploadActivityDocument = async (req, res) => {
  try {
    const { activityId } = req.params;
    const course = await Course.findOne({ "modules.activities._id": activityId });

    if (!course)
      return res.status(404).json({ message: "Activity not found" });

    let selectedModule;
    for (const module of course.modules) {
      if (module.activities.some(a => a._id.toString() === activityId)) {
        selectedModule = module;
        break;
      }
    }

    const activity = selectedModule.activities.find(a => a._id.toString() === activityId);

    const document = {
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };

    activity.documents.push(document);
    await course.save();

    res.json({ message: "Document uploaded", document });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading document", error: err.message });
  }
};

// Delete an activity
exports.deleteActivity = async (req, res) => {
  try {
    const { courseId, moduleId, activityId } = req.params;
    const course = await Course.findOne({
      _id: courseId,
      "modules._id": moduleId
    });

    if (!course)
      return res.status(404).json({ message: "Course or module not found" });

    const module = course.modules.find(m => m._id.toString() === moduleId);

    const beforeCount = module.activities.length;
    module.activities = module.activities.filter(a => a._id.toString() !== activityId);

    if (module.activities.length === beforeCount)
      return res.status(404).json({ message: "Activity not found" });

    await course.save();

    res.json({ message: "Activity deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting activity", error: err.message });
  }
};
