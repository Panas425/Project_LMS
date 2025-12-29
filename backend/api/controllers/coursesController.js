const { v4: uuidv4 } = require("uuid");
const Course = require("../models/Course");
const User = require("../models/User");


exports.createCourse = async (req, res) => {
  try {
    const course = new Course({
      name: req.body.name,
      description: req.body.description,
      startDate: new Date(req.body.start),
      end: req.body.end ? new Date(req.body.end) : null,
      modules: [],
      courseUsers: [],
      userIds: [],
      moduleIds: []
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating course" });
  }
};


exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

exports.addModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Ensure modules and moduleIds arrays exist
    course.modules = course.modules || [];
    course.moduleIds = course.moduleIds || [];

    const module = {
      name: req.body.name,
      description: req.body.description,
      startDate: req.body.start
    };

    course.modules.push(module);
    await course.save();

    res.status(200).json({ message: "Module added", module });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding module" });
  }
};



exports.addUserToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.body.userId);

    if (!course || !user) return res.status(404).json({ message: "Course or User not found" });

    course.userIds = course.userIds || [];
    user.courseIDs = user.courseIDs || [];

    if (!course.userIds.includes(user._id)) {
      course.userIds.push(user._id);
    }

    if (!user.courseIDs.includes(course._id)) {
      user.courseIDs.push(course._id);
    }

    await course.save();
    await user.save();

    res.status(200).json({ message: "User added to course successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding user to course" });
  }
};


exports.getCoursesForUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const courses = await Course.find({ _id: { $in: user.courseIDs } });

    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user courses" });
  }
};
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching course" });
  }
};

