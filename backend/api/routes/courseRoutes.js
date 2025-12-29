const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/coursesController");

router.post("/", coursesController.createCourse);
router.get("/", coursesController.getCourses);

router.get("/:userId/courses", coursesController.getCoursesForUser);
router.get("/getCourseById/:courseId", coursesController.getCourseById);

router.put("/:id/modules", coursesController.addModule);
router.put("/:id/users", coursesController.addUserToCourse);

module.exports = router;
