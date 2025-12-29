const { v4: uuidv4 } = require("uuid");
const Course = require("../models/Course");
const DocumentSchema = require("../models/Document");

exports.addDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res.status(400).json({ message: "No file uploaded" });

    // Find the course
    const course = await Course.findById(req.params.courseId);
    if (!course)
      return res.status(404).json({ message: "Course not found" });

    // Find the module
    const module = course.modules.find(m => m.id === req.params.moduleId);
    if (!module)
      return res.status(404).json({ message: "Module not found" });

    // Find the activity
    const activity = module.activities.find(a => a.id === req.params.activityId);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    // Create new document
    const document = {
      id: uuidv4(),
      name: req.body.name || file.originalname,
      fileUrl: `/uploads/documents/${file.filename}`,
      uploadedAt: new Date()
    };

    activity.documents.push(document);

    // Save course with updated document
    await course.save();

    res.json({ message: "Document added", document });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding document" });
  }
};


exports.getDocuments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const module = course.modules.find(m => m.id === req.params.moduleId);
    if (!module)
      return res.status(404).json({ message: "Module not found" });

    const activity = module.activities.find(a => a.id === req.params.activityId);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    res.json(activity.documents);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching documents" });
  }
};


