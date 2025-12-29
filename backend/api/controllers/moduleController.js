const { v4: uuidv4 } = require("uuid");
const Course = require("../models/Course");

exports.addModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const module = {
      name: req.body.name,
      description: req.body.description,
      start: req.body.start ? new Date(req.body.start) : null,
      end: req.body.end ? new Date(req.body.end) : null,
      activities: []
    };

    course.modules.push(module);
    await course.save();

    res.json({ message: "Module added", module });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding module" });
  }
};

exports.getModules = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId, "modules");
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course.modules);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching modules" });
  }
};

exports.getModuleById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const module = course.modules.find(m => m.id === req.params.moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });

    res.json(module);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching module" });
  }
};
exports.deleteModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const originalLength = course.modules.length;
    course.modules = course.modules.filter(m => m._id.toString() !== req.params.moduleId);

    if (course.modules.length === originalLength)
      return res.status(404).json({ message: "Module not found" });

    await course.save();
    res.json({ message: "Module deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting module" });
  }
};
