// pages/TeacherDashboard.tsx (or app/teacherpage/page.tsx)
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";
import { ICourses, ISubmission, IUpcomingAssignment, IUser } from "../utilsNode";
import { Button, Card, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
import { AddModuleModal } from "../components/AddModuleModal";
import { AddActivityModal } from "../components/AddActivityModal";
import { AddAnnouncementModal } from "../components/AddAnnouncementModal";
import AnnouncementsList from "../components/AnnouncementsList";
import { CourseList } from "../components/CourseList";
import { Timeline, TimelineEvent } from "../components/Timeline";
import { UpcomingAssignments } from "../components/UpcomingAssignmentCard";
import { StudentProgressSummary } from "../components/StudentProgressSummary";

// Simple grade modal component (inline to avoid extra file)
const GradeSubmissionModal = ({ show, submission, onClose, onGradeSubmit }: any) => {
    const [grade, setGrade] = useState("");
    const [loading, setLoading] = useState(false);
    const { updateSubmissionGrade } = useApiDataStore();


    const handleSubmit = async () => {
        if (!grade || isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100) {
            alert("Please enter a valid grade (0-100)");
            return;
        }

        setLoading(true);
        try {
            await updateSubmissionGrade(submission._id, grade);
            onGradeSubmit();
            onClose();
        } catch (error) {
            alert("Failed to save grade");
        } finally {
            setLoading(false);
        }
    };

    if (!show || !submission) return null;

    return (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Grade Submission</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p><strong>Assignment:</strong> {submission.activityName}</p>
                        <p><strong>Student:</strong> {submission.studentName}</p>
                        <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>

                        {submission.fileUrl && (
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-3">
                                View Submission
                            </a>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Grade (0-100)</label>
                            <input
                                type="number"
                                className="form-control"
                                min="0"
                                max="100"
                                step="0.5"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="Enter grade"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Saving..." : "Submit Grade"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function TeacherDashboard() {
    // State
    const [assignments, setAssignments] = useState<ISubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<ISubmission | null>(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);



    // Store hooks
    const {
        myCourses,
        fetchCoursesForUser,
        fetchMySubmissionForActivity,
        fetchRecentAnnouncements,
        fetchTeacherStats,
        teacherStats,
        teacherStatsLoading,
        fetchTeacherSubmissions,
        updateSubmissionGrade
    } = useApiDataStore();

    const { user } = useAuthStore();

    const fetchAllTeacherData = useCallback(async () => {
        if (!user?._id) return;

        setLoading(true);

        try {
            // Fetch data sequentially (easier to debug)
            await fetchCoursesForUser(user._id);

            const submissionsData = await fetchTeacherSubmissions();
            console.log("Submissions response:", submissionsData);

            setAssignments(Array.isArray(submissionsData) ? submissionsData : []);

            await fetchTeacherStats();

            console.log("Teacher data refreshed");
        } catch (error) {
            console.error("Error fetching teacher data:", error);
            setAssignments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?._id, fetchCoursesForUser, fetchTeacherSubmissions, fetchTeacherStats]);

    // Initial load
    useEffect(() => {
        fetchAllTeacherData();
        fetchRecentAnnouncements();
    }, [fetchAllTeacherData, fetchRecentAnnouncements]);

    // Manual refresh handler
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAllTeacherData();
        await fetchRecentAnnouncements();
    };

    // Build timeline events
    useEffect(() => {
        if ((!myCourses || myCourses.length === 0) && assignments.length === 0) return;

        const events: TimelineEvent[] = [];

        // Add course module events
        myCourses?.forEach((course: ICourses) => {
            course.modules?.forEach((module) => {
                if (module.start) {
                    events.push({
                        id: `module-${module._id}`,
                        timestamp: new Date(module.start),
                        description: `Module "${module.name}" started in "${course.name}"`,
                    });
                }

                if (module.end) {
                    events.push({
                        id: `module-end-${module._id}`,
                        timestamp: new Date(module.end),
                        description: `Module "${module.name}" ends in "${course.name}"`,
                    });
                }

                module.activities?.forEach((activity) => {
                    if (activity.start) {
                        events.push({
                            id: `activity-${activity._id}`,
                            timestamp: new Date(activity.start),
                            description: `Activity "${activity.name}" opened in "${module.name}"`,
                        });
                    }

                    if (activity.end) {
                        events.push({
                            id: `activity-deadline-${activity._id}`,
                            timestamp: new Date(activity.end),
                            description: `Deadline: "${activity.name}" in "${module.name}"`,
                        });
                    }
                });
            });
        });

        // Add submission events (only recent ones)
        assignments.slice(0, 10).forEach((submission) => {
            if (submission.submittedAt) {
                events.push({
                    id: `submission-${submission._id}`,
                    timestamp: new Date(submission.submittedAt),
                    description: `${submission.studentName} submitted "${submission.activityName}"${!submission.grade ? ' (pending grading)' : ''}`,
                });
            }
        });

        // Sort by date (newest first) and limit
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setTimelineEvents(events.slice(0, 15));
    }, [myCourses, assignments]);

    // Get upcoming assignments
    const upcomingAssignments: IUpcomingAssignment[] = myCourses && myCourses.length > 0
        ? myCourses.flatMap((course) =>
            (course.modules || []).flatMap((module) =>
                (module.activities || []).map((activity) => ({
                    ...activity,
                    courseName: course.name,
                    dueDate: activity.end,
                    courseId: course._id,
                }))
            )
        )
            .filter((activity) => activity.end && new Date(activity.end) > new Date())
            .sort((a, b) => new Date(a.end!).getTime() - new Date(b.end!).getTime())
            .slice(0, 5)
        : [];

    // Calculate statistics
    const totalStudents = myCourses?.reduce((acc, course) =>
        acc + (course.courseUsers?.length || 0), 0
    ) || 0;

    const pendingGradingCount = assignments.filter(s => !s.grade).length;

    const gradedSubmissions = assignments.filter(s => s.grade);
    const averageGrade = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (parseFloat(s.grade!) || 0), 0) / gradedSubmissions.length)
        : 0;

    // Handle grade submission
    const handleGradeClick = (submission: ISubmission) => {
        setSelectedSubmission(submission);
        setShowGradeModal(true);
    };

    const handleGradeSubmitted = async () => {
        // Refresh submissions after grading
        if (user?._id) {
            const updatedSubmissions = await fetchMySubmissionForActivity(user._id);
            setAssignments(updatedSubmissions || []);
        }
        setShowGradeModal(false);
        setSelectedSubmission(null);
    };

    if (loading && !myCourses) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="primary" />
                <span className="ms-3">Loading your dashboard...</span>
            </div>
        );
    }
    console.log('Pending count:', pendingGradingCount);

    console.log('All submissions:', assignments);


    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="fw-bold mb-1">Teacher Dashboard</h1>
                    <p className="text-white mb-0">
                        Welcome back, {user?.name}!
                        Manage your courses and student submissions.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Refreshing...
                            </>
                        ) : (
                            '🔄 Refresh'
                        )}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">My Courses</h6>
                                    <h2 className="mb-0">{myCourses?.length || 0}</h2>
                                </div>
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                                    📚
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Total Students</h6>
                                    <h2 className="mb-0">{totalStudents}</h2>
                                </div>
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                                    👨‍🎓
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card
                        className="shadow-sm h-100 border-0 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            document.querySelector('.pending-submissions-section')?.scrollIntoView({
                                behavior: 'smooth'
                            });
                        }}
                    >
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Pending Grading</h6>
                                    <h2 className={`mb-0 ${pendingGradingCount > 0 ? 'text-warning' : ''}`}>
                                        {pendingGradingCount}
                                    </h2>
                                </div>
                                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                                    📝
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Average Grade</h6>
                                    <h2 className="mb-0">{averageGrade}%</h2>
                                </div>
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                                    ⭐
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <div className="d-flex flex-wrap gap-3 mb-4">
                <AddModuleModal
                    trigger={<Button variant="primary">+ Add Module</Button>}
                    onSuccess={handleRefresh}
                />
                <AddActivityModal
                    trigger={<Button variant="primary">+ Add Activity</Button>}
                    onSuccess={handleRefresh}
                />
                <Button variant="success" onClick={() => setShowAnnouncementModal(true)}>
                    📢 Post Announcement
                </Button>
            </div>

            {/* Main Content */}
            <Row className="g-4">
                {/* Left Column */}
                <Col lg={8}>
                    <div className="d-flex flex-column gap-4">
                        {/* My Courses */}
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white">
                                <h4 className="fw-bold mb-0">My Courses</h4>
                            </Card.Header>
                            <Card.Body>
                                <CourseList loading={loading} myCourses={myCourses || []} />
                            </Card.Body>
                        </Card>

                        {/* Pending Submissions */}
                        <Card className="shadow-sm pending-submissions-section">
                            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                <h4 className="fw-bold mb-0">Pending Submissions</h4>
                                {pendingGradingCount > 0 && (
                                    <Badge bg="warning" className="ms-2">
                                        {pendingGradingCount} needs grading
                                    </Badge>
                                )}
                            </Card.Header>
                            <Card.Body>
                                {pendingGradingCount === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        ✅ All caught up! No pending submissions to grade.
                                    </div>
                                ) : (
                                    <div className="list-group">
                                        {assignments
                                            .filter(submission => !submission.grade)
                                            .map((submission) => (
                                                <div key={submission._id} className="list-group-item list-group-item-action">
                                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                        <div>
                                                            <h6 className="mb-1">{submission.activityName}</h6>
                                                            <small className="text-muted">
                                                                <strong>{submission.studentName}</strong> •
                                                                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => handleGradeClick(submission)}
                                                        >
                                                            Grade
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Upcoming Assignments */}
                        <UpcomingAssignments
                            loading={loading}
                            upcomingAssignments={upcomingAssignments}
                        />
                    </div>
                </Col>

                {/* Right Column */}
                <Col lg={4}>
                    <div className="d-flex flex-column gap-4">
                        {/* Announcements */}
                        <AnnouncementsList />

                        {/* Activity Timeline */}
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white">
                                <h4 className="fw-bold mb-0">Recent Activity</h4>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {timelineEvents.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        No recent activity to display
                                    </div>
                                ) : (
                                    <Timeline events={timelineEvents} />
                                )}
                            </Card.Body>
                        </Card>

                        {/* Student Progress Summary */}
                        <StudentProgressSummary
                            students={teacherStats?.students ?? []}
                            submissions={teacherStats?.submissions ?? []}
                            courses={myCourses || []}
                            loading={teacherStatsLoading}
                        />

                        {/* Quick Tips */}
                        <Card className="shadow-sm bg-light border-0">
                            <Card.Body>
                                <h6 className="fw-bold mb-2">💡 Quick Tips</h6>
                                <ul className="small mb-0 ps-3">
                                    <li>Grade submissions promptly to keep students engaged</li>
                                    <li>Post weekly announcements to update your class</li>
                                    <li>Use the timeline to track all course activities</li>
                                    <li>Monitor student progress through the summary chart</li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>

            {/* Modals */}
            <AddAnnouncementModal
                show={showAnnouncementModal}
                handleClose={() => setShowAnnouncementModal(false)}
                onSuccess={() => {
                    fetchRecentAnnouncements();
                    setShowAnnouncementModal(false);
                }}
            />

            <GradeSubmissionModal
                show={showGradeModal}
                submission={selectedSubmission}
                onClose={() => {
                    setShowGradeModal(false);
                    setSelectedSubmission(null);
                }}
                onGradeSubmit={handleGradeSubmitted}
            />
        </div>
    );
}