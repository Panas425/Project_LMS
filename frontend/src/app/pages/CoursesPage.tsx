"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";

export default function CoursesPage() {
    const {
        myCourses,
        fetchCoursesForUser,
    } = useApiDataStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const { user } = useAuthStore();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;

            setLoading(true);
            await fetchCoursesForUser(user._id);
            setLoading(false);
        };

        fetchData();
    }, [user?._id, fetchCoursesForUser]);

    const filteredCourses =
        myCourses?.filter(
            (course) =>
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

    return (
        <div className="container py-5">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold">Browse Courses</h1>
                    <p className="text-gray-500 dark:text-gray-300">Explore and enroll in available courses</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="mb-4 position-relative">
                <input
                    type="search"
                    className="form-control ps-4"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* COURSES GRID */}
            {loading ? (
                <div className="row g-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="col-md-6 col-lg-4">
                            <div className="card shadow-sm p-4" style={{ minHeight: "200px" }}>
                                <div className="placeholder-glow">
                                    <span className="placeholder col-12"></span>
                                    <span className="placeholder col-7 mt-2"></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="row g-4">
                    {filteredCourses.map((course) => (
                        <div key={course._id} className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{course.name}</h5>
                                    <p className="card-text text-muted flex-grow-1">{course.description}</p>

                                    {user?.role === "teacher" && (
                                        <Link href={`/teacherpage/courses/${course._id}`} className="btn btn-primary mt-auto">
                                            View Course
                                        </Link>
                                    )}

                                    {user?.role === "student" && (
                                        <Link href={`/studentpage/courses/${course._id}`} className="btn btn-primary mt-auto">
                                            View Course
                                        </Link>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5 text-muted">
                    <p className="fs-5">No courses found</p>
                    <p className="small">Try adjusting your search</p>
                </div>
            )}
        </div>
    );
}
