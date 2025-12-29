const Course = require("../models/Course");

exports.addSubmission = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const module = course.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });

    const activity = module.activities.id(req.params.activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const dueDate = activity.end ? new Date(activity.end) : null;
    const submittedAt = new Date();

    const submission = {
      fileName: req.body.fileName || req.file.originalname,
      fileUrl: `/uploads/submissions/${req.file.filename}`,

      studentName: req.body.studentName,
      studentId: req.body.studentId,
      userId: req.body.userId, // auth user id

      courseId: course._id.toString(),
      activityId: activity._id.toString(),
      activityName: activity.name,

      submitted: true,
      submittedAt,
      dueDate,
      submittedLate: dueDate ? submittedAt > dueDate : false,

      grade: null,
      score: null
    };

    if (!activity.submissions) activity.submissions = [];
    const newSub = activity.submissions.create(submission);
    activity.submissions.push(newSub);

    await course.save();

    res.json({ 
      message: "Submission added successfully", 
      submission: newSub.toObject() 
    });
  } catch (err) {
    console.error("addSubmission error:", err);
    res.status(500).json({ message: "Error adding submission", error: err.message });
  }
};


exports.getSubmissions = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const module = course.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });

    const activity = module.activities.id(req.params.activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const submissions = activity.submissions.map(sub => ({
      ...sub.toObject(),
      activityName: sub.activityName || activity.name,
    }));

    res.json(submissions);
  } catch (err) {
    console.error("getSubmissions error:", err);
    res.status(500).json({ message: "Error fetching submissions", error: err.message });
  }
};


// Get submissions for a specific student
exports.getSubmissionsForStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const courses = await Course.find({
      "modules.activities.submissions.studentId": studentId,
    });

    const studentSubmissions = [];

    courses.forEach(course => {
      course.modules.forEach(module => {
        module.activities.forEach(activity => {
          (activity.submissions || []).forEach(sub => {
            if (sub.studentId === studentId) {
              const subObj = sub.toObject ? sub.toObject() : { ...sub };
              studentSubmissions.push({
                courseId: course._id,
                moduleId: module._id,
                activityId: activity._id,
                ...subObj,
              });
            }
          });
        });
      });
    });

    res.json(studentSubmissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching student submissions" });
  }
};

// Delete submission by student
exports.deleteSubmissionByStudent = async (req, res) => {
  try {
    const submissionId = req.params.id;

    const courses = await Course.find({
      "modules.activities.submissions._id": submissionId,
    });

    if (!courses.length)
      return res.status(404).json({ message: "Submission not found" });

    for (const course of courses) {
      course.modules.forEach(module => {
        module.activities.forEach(activity => {
          activity.submissions = (activity.submissions || []).filter(
            sub => sub._id.toString() !== submissionId
          );
        });
      });
      await course.save();
    }

    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting submission" });
  }
};

// Update a submission grade
exports.updateSubmissionGrade = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade } = req.body;

    if (grade === undefined)
      return res.status(400).json({ message: "Grade is required" });

    const courses = await Course.find({
      "modules.activities.submissions._id": submissionId,
    });

    if (!courses.length)
      return res.status(404).json({ message: "Submission not found" });

    let updated = false;

    for (const course of courses) {
      course.modules.forEach(module => {
        module.activities.forEach(activity => {
          const submission = activity.submissions.id(submissionId);
          if (submission) {
            submission.grade = grade;
            updated = true;
          }
        });
      });
      await course.save();
    }

    if (!updated)
      return res.status(404).json({ message: "Submission not found in activity" });

    res.json({ message: "Grade updated successfully", submissionId, grade });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating submission grade" });
  }
};
