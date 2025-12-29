"use client";
import { Link } from "react-bootstrap-icons";
import { ICourses } from "../utilsNode";
import { CourseCard } from "./CourseCard";

interface CoursesListProps {
    loading: boolean;
    myCourses: ICourses[];
}

export function CourseList({ myCourses, loading }: CoursesListProps) {
    return (
        <div className="card shadow-sm w-50">
            <div className="card-header bg-white">
                <h4 className="fw-bold mb-0">My Courses</h4>
            </div>

            <div className="card-body">
                {loading ? (
                    <p className="text-muted">Loading courses...</p>
                ) : myCourses.length > 0 ? (
                    myCourses.map((course) => <CourseCard key={course._id} course={course} />)
                ) : (
                    <p className="text-muted text-center py-4">
                        You are not enrolled in any courses
                    </p>
                )}
            </div>
        </div>
    );
};