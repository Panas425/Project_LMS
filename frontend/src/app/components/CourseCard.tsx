"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { ICourses } from "../utilsNode";
import { useAuthStore } from "../storesNode/useAuthStoreNode";

interface CourseCardProps {
  course: ICourses;
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const totalActivities = course.modules?.reduce(
    (sum, module) => sum + (module.activities?.length || 0),
    0
  ) || 0;
  
  const { user } = useAuthStore();

  const handleNavigateToCourse = async () => {
    if (!user?.role || isNavigating) return;

    setIsNavigating(true);
    
    try {
      const paths = {
        teacher: `/teacherpage/courses/${course._id}`,
        student: `/studentpage/courses/${course._id}`,
      };

      const path = paths[user.role as keyof typeof paths];
      if (path) {
        await router.push(path);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  const getButtonText = () => {
    if (isNavigating) return "Loading...";
    if (user?.role === "teacher") return "Manage Course";
    if (user?.role === "student") return "Enter Course";
    return "View Course";
  };

  return (
    <div className="card mb-3 shadow-sm border-0 p-3 hover-shadow">
      <h5 className="fw-semibold">{course.name}</h5>
      <p className="text-muted small">{course.description}</p>

      {/* Course Details */}
      <div className="row text-center my-3">
        <div className="col">
          <h6 className="mb-0">{course.modules?.length || 0}</h6>
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
        onClick={handleNavigateToCourse}
        disabled={isNavigating}
        className="btn btn-primary w-100"
      >
        {getButtonText()}
      </Button>
    </div>
  );
}