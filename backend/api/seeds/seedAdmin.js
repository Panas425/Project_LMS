const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User"); // adjust path to your model

async function seedAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ role: "admin" }); // lowercase
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const firstName = "Default";
    const lastName = "Admin";
    const email = "admin@example.com";

    // Generate username
    const base = (firstName.substring(0, 2) + lastName.substring(0, 1)).toLowerCase();
    let username;
    let exists = true;

    while (exists) {
      const num = Math.floor(100 + Math.random() * 900);
      username = `${base}${num}`;
      exists = await User.findOne({ username });
    }

    // Password
    const passwordPlain = "Password123!";
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    const adminUser = new User({
      firstName,
      lastName,
      email,
      username,           // must match the model field exactly
      password: passwordHash,
      role: "admin",      // must match enum in model
      createdAt: new Date(),
    });

    await adminUser.save();

    console.log("✅ Default admin created:");
    console.log(`Username: ${username}`);
    console.log(`Password: ${passwordPlain}`);

  } catch (err) {
    console.error("❌ Error seeding admin:", err);
  }
}

module.exports = seedAdmin;
