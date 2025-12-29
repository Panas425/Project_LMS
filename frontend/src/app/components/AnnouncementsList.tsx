"use client";

import { Trash } from "react-bootstrap-icons";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";
import { useEffect, useState } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import { IAnnouncement, ICourses } from "../utilsNode";

interface AnnouncementsListProps {
    courseId?: string;
    currentCourse?: ICourses;
}

export default function AnnouncementsList({ courseId, currentCourse }: AnnouncementsListProps) {
    const { user } = useAuthStore();
    const { fetchRecentAnnouncements, fetchAnnoucementsForCourse, deleteAnnouncement, announcements } = useApiDataStore();
    const myCourses = useApiDataStore((state) => state.myCourses);



    console.log(courseId)

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?._id) return;

        const load = async () => {
            setLoading(true);
            try {
                if (courseId) {
                    await fetchAnnoucementsForCourse(courseId);
                } else {
                    await fetchRecentAnnouncements();
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user?._id, courseId]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        setLoading(true);
        try {
            await deleteAnnouncement(id); // store updates automatically
            if (courseId) await fetchAnnoucementsForCourse(courseId);
            else await fetchRecentAnnouncements();
        } catch (err) {
            console.error(err);
            alert("Failed to delete announcement");
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="d-flex justify-content-center py-4">
                <Spinner animation="border" role="status" />
            </div>
        );

    if (!announcements || announcements.length === 0)
        return <p className="text-muted">No announcements yet.</p>;




    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
                <h4 className="fw-bold mb-0">Recent Announcements</h4>
            </div>
            <div className="card-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {announcements.length > 0 ? (
                    announcements.map((a) => {
                        let courseName = null;

                        if (currentCourse) {
                            // Inside a specific course page
                            courseName = currentCourse.name;
                        } else {
                            // Dashboard view
                            const course = myCourses.find((c) => String(c._id) === String(a.courseId));
                            courseName = course?.name || null;
                        }

                        return (
                            <Card key={a._id} className="mb-3 p-3 shadow-sm border-0">
                                <Card.Body className="d-flex flex-column">
                                    <div>
                                        <Card.Title className="fw-semibold mb-1">{a.title}</Card.Title>
                                        <Card.Text className="small text-muted mb-1">{a.message}</Card.Text>
                                        {!courseName &&
                                            <small className="text-muted">{a.courseName || "General"}</small>
                                        }
                                    </div>

                                    {user?.role === "teacher" && (
                                        <div className="mt-auto ms-auto">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(a._id)}
                                                disabled={loading}
                                            >
                                                <Trash />
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        );
                    })
                ) : (
                    <p className="text-muted text-center py-4">No recent announcements</p>
                )}
            </div>
        </div>


    );
}
