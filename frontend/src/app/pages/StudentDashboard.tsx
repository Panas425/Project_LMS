"use client";

import { useEffect, useState } from "react";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";
import { IActivity, ICourses, IModules, ISubmission } from "../utilsNode";
import { ActivityModal } from "../components/ActivityModal";
import AnnouncementsList from "../components/AnnouncementsList";
import { UpcomingAssignments } from "../components/UpcomingAssignmentCard";
import { CourseList } from "../components/CourseList";

export default function StudentDashboard() {
    const { myCourses, fetchCoursesForUser, fetchMySubmissionForActivity } = useApiDataStore();

    const [submissions, setSubmissions] = useState<ISubmission[]>([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuthStore();

    const [showModal, setShowModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<ICourses | null>(null);
    const [selectedModule, setSelectedModule] = useState<IModules | null>(null);

    // 🔹 Load courses + submissions
    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;
            setLoading(true);

            await fetchCoursesForUser(user._id);
            const mySubs = await fetchMySubmissionForActivity(user._id);
            setSubmissions(mySubs || []);

            setLoading(false);
        };
        fetchData();
    }, [user?._id]);

    const upcomingAssignments = myCourses
        ?.flatMap(course =>
            (course.modules || []).flatMap(module =>
                (module.activities || []).map(activity => {
                    const extendedActivity: IActivity & { courseId: string; courseName: string; dueDate: Date } = {
                        ...activity,
                        courseId: course._id,
                        courseName: course.name,
                        moduleId: module._id,
                        dueDate: new Date(activity.end!), // make it a Date
                    };
                    return extendedActivity;
                })
            )
        )
        .filter(a => a.dueDate > new Date())
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 5) || [];


    return (
        <div className="container py-4">

            {/* PAGE HEADER */}
            <div className="mb-4">
                <h1 className="fw-bold">Student Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-300">Welcome back! Here’s an overview of your learning activity.</p>
            </div>

            <div className="row g-4">

                {/* LEFT SIDE */}
                <div className="col-lg-8">

                    {/* MY COURSES */}
                    <div className="card shadow-sm mb-4">

                        <div className="card-body">
                            <CourseList myCourses={myCourses} loading={loading} />
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="col-lg-4">

                    {/* ANNOUNCEMENTS */}
                    <div className="card shadow-sm mb-4">
                        <AnnouncementsList />


                    </div>

                    {/* UPCOMING ASSIGNMENTS */}
                    <div className="card shadow">
                        <UpcomingAssignments
                            loading={loading}
                            upcomingAssignments={upcomingAssignments}
                        />

                    </div>

                </div>
            </div>

            {/* ACTIVITY MODAL */}
            {selectedActivity && selectedCourse && selectedModule && (
                <ActivityModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    module={selectedModule}
                    course={selectedCourse}
                    activitiesList={selectedModule.activities}
                    user={user!}
                    showVideoModal={false}
                    showFormModal={false}
                    handleCloseVideoModal={() => { }}
                    handleCloseFormModal={() => { }}
                    handleOpenFormActivity={() => { }}
                    handleSubmitForm={async () => { }}
                    handleActivitySuccess={() => { }}
                />
            )}
        </div>
    );
}