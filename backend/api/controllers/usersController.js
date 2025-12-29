const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // adjust path if needed
const Course = require("../models/Course"); // import Course if you use it

exports.getAllUsers = async (req, res) => {
  try {
    const query = {};

    if (req.query.role) query.role = req.query.role.toLowerCase();
    if (req.query.courseId) query.courseIDs = req.query.courseId;

    const users = await User.find(query).lean();
    res.status(200).json(users);

  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);

  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, courseIDs = [] } = req.body;

    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedRole = role.toLowerCase();

    // Check existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: "User with this email already exists" });

    // Generate username
    const base = (firstName.substring(0, 2) + lastName.substring(0, 1)).toLowerCase();
    let username;
    let exists = true;
    while (exists) {
      const num = Math.floor(100 + Math.random() * 900);
      username = `${base}${num}`;
      exists = await User.findOne({ username });
    }

    // Default password
    const rawPassword = normalizedRole === "teacher" ? "teacher123" : "student123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create user document
    const user = new User({
      _id: crypto.randomUUID(),
      firstName,
      lastName,
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      courseIDs: Array.isArray(courseIDs) ? courseIDs : []
    });

    await user.save();

    // Add user to courses if courseIDs provided
    const courseUpdateResults = [];
    for (const cId of user.courseIDs) {
      const course = await Course.findById(cId);
      if (!course) {
        courseUpdateResults.push({ courseId: cId, ok: false, reason: "Course not found" });
        continue;
      }

      course.userIds = course.userIds || [];
      course.courseUsers = course.courseUsers || [];

      if (!course.userIds.includes(user._id)) course.userIds.push(user._id);

      if (!course.courseUsers.some(u => u._id === user._id)) {
        course.courseUsers.push({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        });
      }

      await course.save();
      courseUpdateResults.push({ courseId: cId, ok: true });
    }

    // Respond without password
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json({
      message: "User created and course updates attempted",
      user: userWithoutPassword,
      defaultPassword: rawPassword,
      courseUpdateResults
    });

  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optionally, remove user from courses
    await Course.updateMany(
      { userIds: user._id },
      {
        $pull: {
          userIds: user._id,
          courseUsers: { _id: user._id }
        }
      }
    );

    res.json({ message: "User deleted" });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};



