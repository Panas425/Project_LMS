"use client";
import React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";
import { ICourses, ISubmission, IUpcomingAssignment, IUser } from "../utilsNode";
import { Button, Card } from "react-bootstrap";
import { AddModuleModal } from "../components/AddModuleModal";
import { AddActivityForm } from "../components/AddActivityForm";
import { ActivityModal } from "../components/ActivityModal";
import { AddActivityModal } from "../components/AddActivityModal";
import { AddAnnouncementModal } from "../components/AddAnnouncementModal";
import AnnouncementsList from "../components/AnnouncementsList";
import { CourseCard } from "../components";
import { CourseList } from "../components/CourseList";
import { Timeline, TimelineEvent } from "../components/Timeline";
import { UpcomingAssignments } from "../components/UpcomingAssignmentCard";
import { StudentProgressSummary } from "../components/StudentProgressSummary";

export default function TeacherDashboard() {
    const { myCourses, fetchCoursesForUser, teacherStatsLoading, fetchMySubmissionForActivity, fetchRecentAnnouncements, fetchTeacherStats, teacherStats } =
        useApiDataStore();


    const [assignments, setAssignments] = useState<ISubmission[]>([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuthStore();
    const [showModal, setShowModal] = useState(false);

    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);


    const [students, setStudents] = useState<IUser[]>([]);
    const [submissions, setSubmissions] = useState<ISubmission[]>([]);

    useEffect(() => {
        fetchTeacherStats();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;
            console.log("COURSES:", myCourses);


            setLoading(true);
            console.log(user._id)
            await fetchCoursesForUser(user._id);

            const myAssignments = await fetchMySubmissionForActivity(user._id);
            setAssignments(myAssignments || []);

            setLoading(false);
        };

        fetchData();
    }, [user?._id]);

    useEffect(() => {
        fetchTeacherStats();
        fetchRecentAnnouncements();
    }, []);

    useEffect(() => {
        // Example: populate timelineEvents
        const events: TimelineEvent[] = [
            { id: "1", timestamp: new Date(), description: "Sample event" },
        ];
        setTimelineEvents(events);
    }, []);

    useEffect(() => {
        if (!myCourses) return;

        const events: TimelineEvent[] = [];

        myCourses.forEach((course: ICourses) => {
            course.modules?.forEach((module) => {
                if (!module.start) return; // skip if start is undefined

                events.push({
                    id: `module-${module._id}`,
                    timestamp: new Date(module.start),
                    description: `Module "${module.name}" was edited in "${course.name}"`,
                });

                module.activities?.forEach((activity) => {
                    if (!activity.start) return; // skip if start is undefined

                    events.push({
                        id: `activity-${activity._id}`,
                        timestamp: new Date(activity.start),
                        description: `Activity "${activity.name}" was created in "${module.name}"`,
                    });
                });
            });
        });

        assignments.forEach((submission) => {
            if (!submission.submittedAt) return; // skip if submission date is missing

            events.push({
                id: `submission-${submission._id}`,
                timestamp: new Date(submission.submittedAt),
                description: `Student "${submission.studentName}" submitted "${submission.activityName}"`,
            });
        });

        // Sort newest first
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setTimelineEvents(events);
    }, [myCourses, assignments]);

    const upcomingAssignments: IUpcomingAssignment[] = myCourses
        .flatMap((course) =>
            (course.modules || []).flatMap((module) =>
                (module.activities || []).map((activity) => ({
                    ...activity,
                    courseName: course.name,
                    dueDate: activity.end, // FIX: use the real date field
                    courseId: course._id,
                }))
            )
        )
        .filter((activity) => activity.end && new Date(activity.end) > new Date()) // future only
        .sort(
            (a, b) => new Date(a.end!).getTime() - new Date(b.end!).getTime() // soonest first
        )
        .slice(0, 3);

    return (
        <div className="container py-5">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Teacher Dashboard</h1>
            </div>

            {/* QUICK ACTIONS */}
            <div className="d-flex flex-wrap gap-3 mb-4">
                <AddModuleModal
                    trigger={<Button variant="primary">+ Add Module</Button>}
                    onSuccess={() => { }}
                />
                <AddActivityModal
                    trigger={<Button variant="primary">+ Add Activity</Button>}
                    onSuccess={() => { }}
                />
                <Button onClick={() => setShowModal(true)}>+ Add Announcement</Button>
            </div>

            <AddAnnouncementModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={() => fetchRecentAnnouncements()}
            />

            {/* MAIN ROW */}
            <div className="row g-3" style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }}>

                {/* LEFT COLUMN: Courses + Upcoming Assignments */}
                <div className="col-lg-8 d-flex flex-column gap-3">
                    <CourseList loading={loading} myCourses={myCourses} />
                    <UpcomingAssignments
                        loading={loading}
                        upcomingAssignments={upcomingAssignments}
                    />
                </div>

                {/* RIGHT COLUMN: Timeline + Recent Announcements */}
                <div className="col-lg-4 d-flex flex-column gap-3">
                    <AnnouncementsList />
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h4 className="fw-bold mb-0">Activity Timeline</h4>
                        </div>
                        <div className="card-body">
                            <Timeline events={timelineEvents} />
                        </div>
                    </div>

                    <StudentProgressSummary
                        students={teacherStats?.students ?? []}
                        submissions={teacherStats?.submissions ?? []}
                        courses={myCourses}
                        loading={teacherStatsLoading}
                    />
                </div>
            </div>
        </div>

    );
}
