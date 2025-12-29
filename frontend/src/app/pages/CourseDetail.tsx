"use client";
import { Suspense, useState, useEffect } from "react";
import { Spinner, Tabs, Tab, Card, Button } from "react-bootstrap";
import { ModuleList } from "../components/ModuleList";
import { AddModuleModal } from "../components/AddModuleModal";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { ICourses, IModules } from "../utilsNode";
import AnnouncementsList from "../components/AnnouncementsList";

export default function CourseDetail({ courseId, role }: { courseId: string, role: string }) {
    const { getCourseByIdFromRouter } = useApiDataStore();
    const isTeacher = role === "teacher";

    const [course, setCourse] = useState<ICourses>();
    const [modules, setModules] = useState<IModules[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"modules" | "students">("modules");

    useEffect(() => {
        const loadCourse = async () => {
            setLoading(true);
            const courseData = await getCourseByIdFromRouter(courseId);
            setCourse(courseData);
            setModules(courseData.modules || []);
            setLoading(false);
        };
        loadCourse();
    }, [courseId, getCourseByIdFromRouter]);



    const handleModuleAdded = async () => {
        if (course?._id) {
            const updatedCourse = await getCourseByIdFromRouter(course._id);
            setModules(updatedCourse.modules || []);
        }
    };

    const handleModuleDeleted = (deletedModuleId: string) => {
        setModules(prev => prev.filter(m => m._id !== deletedModuleId));
    };


    return (
        <div className="container py-5">
            <div className="d-flex align-items-center mb-4">
                <h1>{course?.name || "Loading..."}</h1>
                {isTeacher && !loading && <div className="ms-auto"><AddModuleModal onSuccess={handleModuleAdded} /></div>}
            </div>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Card className="mb-4">
                    <Card.Body>
                        <p>{course?.description}</p>

                        <div className="d-flex gap-5 mt-3">
                            <div>
                                <h4>{course?.courseUsers?.length || 0}</h4>
                                <p className="text-muted">Students</p>
                            </div>

                            <div>
                                <h4>{modules.length}</h4>
                                <p className="text-muted">Modules</p>
                            </div>

                            <div>
                                <h4>{course?.start ? new Date(course.start).toLocaleDateString() : "-"}</h4>
                                <p className="text-muted">Started</p>
                            </div>
                        </div>

                    </Card.Body>
                </Card>
            )}

            {/* Tabs */}
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)} className="mb-3">
                <Tab eventKey="modules" title="Modules">
                    <Suspense fallback={<Spinner animation="border" />}>
                        <ModuleList course={course!} modules={modules} onModuleDeleted={handleModuleDeleted} />
                    </Suspense>
                </Tab>

                {isTeacher && (
                    <Tab eventKey="students" title="Students">
                        {course?.courseUsers?.length ? (
                            course.courseUsers.map((s, idx) => (
                                <Card key={s._id || s._id || idx} className="mb-2 p-3">
                                    <div>{s.fullName || `${s.firstName} ${s.lastName}`}</div>
                                </Card>
                            ))
                        ) : (
                            <p className="text-muted text-center py-4">No students enrolled yet</p>
                        )}
                    </Tab>
                )}
            </Tabs>
            <AnnouncementsList courseId={courseId} currentCourse={course}/>

        </div>
    );
}

