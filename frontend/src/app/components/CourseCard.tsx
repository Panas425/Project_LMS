"use client";
import { Button } from "react-bootstrap";
import { ICourses } from "../utilsNode";

interface CourseCardProps {
  course: ICourses;
}

export function CourseCard({ course }: CourseCardProps) {
  const totalActivities = course.modules.reduce(
    (sum, module) => sum + module.activities.length,
    0
  );
  return (
    <div className="card mb-3 shadow-sm border-0 p-3 hover-shadow">
      <h5 className="fw-semibold">{course.name}</h5>
      <p className="text-muted small">{course.description}</p>

      {/* Course Details */}
      <div className="row text-center my-3">
        <div className="col">
          <h6 className="mb-0">{course.modules.length}</h6>
          <small className="text-muted">Modules</small>
        </div>
        <div className="col">
          <h6 className="mb-0">{totalActivities}</h6>
          <small className="text-muted">Activities</small>
        </div>
        <div className="col">
          <h6 className="mb-0">{course.courseUsers?.length ?? 0}</h6>
          <small className="text-muted">Students</small>
        </div>
      </div>

      {/* Go to Course Button */}
      <Button
        href={`/teacherpage/courses/${course._id}`}
        className="btn btn-primary w-100"
      >
        Go to Course
      </Button>
    </div>
  );
};
