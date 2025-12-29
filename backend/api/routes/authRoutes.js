const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/User"); // <-- Mongoose model

// Generate random 8-character password
function generatePassword() {
  return crypto.randomBytes(6).toString("base64").slice(0, 8);
}

// Generate unique username
async function generateUniqueUsername(firstName, lastName) {
  const base = (firstName.substring(0, 2) + lastName.substring(0, 1)).toLowerCase();
  let username;
  let exists = true;

  while (exists) {
    const num = Math.floor(100 + Math.random() * 900);
    username = `${base}${num}`;
    exists = await User.findOne({ username });
  }

  return username;
}

// Admin-only register user
router.post("/register", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    if (!firstName || !lastName || !email || !role)
      return res.status(400).json({ message: "Missing required fields" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: "Email already exists" });

    const username = await generateUniqueUsername(firstName, lastName);
    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = new User({
      _id: user._id.toString(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      username,
      password: passwordHash,
      role: role.toLowerCase(), // must match enum in User model: "teacher", "student", "admin"
      courseIDs: []
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username,
        email: newUser.email,
        role: newUser.role,
        tempPassword
      }
    });

  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid password" });

    // ✅ Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Prepare JWT payload
    const payload = {
      _id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ accessToken, refreshToken });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
