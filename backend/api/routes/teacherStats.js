const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");


router.get("/stats", authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user?._id;
        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // fetch only teacher's courses
        const courses = await Course.find({ teacherID: teacherId });

        const students = await User.find({ role: "Student" });

        let behindCount = 0;
        let inactiveCount = 0;
        let missingAssignments = 0;
        let topPerformers = 0;

        const now = new Date();

        // 1️⃣ Students who haven't logged in recently (7+ days)
        students.forEach(student => {
            if (now - new Date(student.lastLogin) > 7 * 24 * 60 * 60 * 1000) {
                inactiveCount++;
            }
        });

        // 2️⃣ Loop through all courses/modules/activities
        students.forEach(student => {
            let studentGrades = [];
            let totalActivities = 0;
            let completedActivities = 0;
            let missedActivities = 0;

            courses.forEach(course => {
                course.modules.forEach(module => {
                    module.activities.forEach(activity => {
                        totalActivities++;

                        const submission = activity.submissions.find(
                            s => s.studentId === student._id.toString()
                        );

                        // Missing assignment?
                        if (!submission && activity.deadline < now) {
                            missedActivities++;
                            missingAssignments++;
                        }

                        // Falling behind if submission is late
                        if (submission && submission.submittedAt > activity.deadline) {
                            behindCount++;
                        }

                        if (submission) {
                            completedActivities++;
                            if (submission.grade) studentGrades.push(Number(submission.grade));
                        }
                    });
                });
            });

            // 3️⃣ Top performers: 90%+ completion + high grades
            const completionRate = completedActivities / (totalActivities || 1);

            const avgGrade =
                studentGrades.reduce((a, b) => a + b, 0) /
                (studentGrades.length || 1);

            if (completionRate >= 0.9 || avgGrade >= 90) topPerformers++;
        });

        res.json({
            behindCount,
            inactiveCount,
            missingAssignments,
            topPerformers,
        });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ message: "Error calculating stats" });
    }
});

module.exports = router;
