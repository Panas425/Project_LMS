// api/seeds/seedUsers.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Adjust path if needed
const Course = require("../models/Course");
require("dotenv").config();

async function seedUsers() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Clear previous users
    await User.deleteMany({});
    console.log("🧹 Cleared existing users");

    // 3️⃣ Fetch existing courses
    const courses = await Course.find();
    if (courses.length < 2) {
      console.error("⚠️ Please seed courses first (run seedCourses.js)");
      process.exit(1);
    }

    // 4️⃣ Hash passwords
    const passwordStudent1 = await bcrypt.hash("student123", 10);
    const passwordStudent2 = await bcrypt.hash("student456", 10);
    const passwordTeacher1 = await bcrypt.hash("teacher123", 10);
    const passwordTeacher2 = await bcrypt.hash("teacher456", 10);

    // 5️⃣ Create user data
    const users = [
      {
        username: "student_one",
        email: "student1@example.com",
        password: passwordStudent1,
        role: "student",
        firstName: "Student",
        lastName: "One",
        courseIDs: [courses[0]._id.toString()],
      },
      {
        username: "student_two",
        email: "student2@example.com",
        password: passwordStudent2,
        role: "student",
        firstName: "Student",
        lastName: "Two",
        courseIDs: [courses[0]._id.toString()],
      },
      {
        username: "teacher_one",
        email: "teacher1@example.com",
        password: passwordTeacher1,
        role: "teacher",
        firstName: "Teacher",
        lastName: "One",
        courseIDs: [courses[0]._id.toString()],
      },
      {
        username: "teacher_two",
        email: "teacher2@example.com",
        password: passwordTeacher2,
        role: "teacher",
        firstName: "Teacher",
        lastName: "Two",
        courseIDs: [courses[1]._id.toString()],
      },
    ];

    // 6️⃣ Insert users
    const createdUsers = await User.insertMany(users);

    for (const user of createdUsers) {
      for (const courseId of user.courseIDs) {
        await Course.updateOne(
          { _id: courseId },
          {
            $push: {
              courseUsers: {
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
              },
            },
          }
        );
      }
    }


    console.log("✅ 2 teachers and 2 students seeded successfully!");
    console.table(
      createdUsers.map((u) => ({
        username: u.username,
        role: u.role,
        courseIDs: u.courseIDs,
      }))
    );

    // 7️⃣ Close connection
    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
}

// Run the seeder
seedUsers();
