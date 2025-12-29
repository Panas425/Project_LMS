// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const announcementRoutes = require("./routes/announcementsRoutes");
const teacherStatsRoutes = require("./routes/teacherStats");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/teacher", teacherStatsRoutes);

module.exports = app;
