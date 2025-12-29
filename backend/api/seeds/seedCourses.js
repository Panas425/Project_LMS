// seeds/seedCourses.js
require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course"); // your mongoose Course model

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear old courses
    await Course.deleteMany({});
    console.log("🧹 Cleared existing courses");

    const now = new Date();

    const seedData = [
      { name: "Web Development 101", description: "Intro to web technologies", start: now },
      { name: "Node.js Mastery", description: "Learn backend with Node and Express", start: now },
      { name: "Database Systems", description: "Learn MongoDB and relational concepts", start: now },
      { name: "Frontend Frameworks", description: "React, Vue, and modern UI building", start: now },
    ].map(course => ({
      ...course,
      end: null,
      modules: [],
      courseUsers: [],
      documents: [],
      moduleIds: [],
      userIds: [],
      courseUserIds: [],
      documentIds: [],
    }));

    const createdCourses = await Course.insertMany(seedData);
    console.log("✅ 4 demo courses seeded successfully!");
    console.table(
      createdCourses.map(c => ({ name: c.name, description: c.description }))
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding courses:", err);
    process.exit(1);
  }
}

seedCourses();
