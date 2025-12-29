"use client";

import { Modal, Button, ListGroup, Spinner, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";
import { ISubmission } from "../utilsNode";


interface Props {
    show: boolean;
    onClose: () => void;
    courseId: string;
    moduleId: string;
    activityId: string;
    activityName: string;
}

export function ActivitySubmissionsModal({
    show,
    onClose,
    courseId,
    moduleId,
    activityId,
    activityName,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [submissions, setSubmissions] = useState<ISubmission[]>([]);
    const [gradeModalOpen, setGradeModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<ISubmission | null>(null);
    const [gradeText, setGradeText] = useState("");

    const { fetchSubmissionsByActivity, updateSubmissionGrade } = useApiDataStore();
    const { user } = useAuthStore();

    const buildGradeText = (grade: string | null | undefined) => {
        if (!grade || grade.trim() === "") return ""; // ← keep empty until typing starts
        return `✅ Graded by ${user?.name ?? "Teacher"}: ${grade}`;
    };

    // Load submissions when modal opens
    useEffect(() => {
        if (!show) return;

        const load = async () => {
            setLoading(true);
            try {
                const subs = await fetchSubmissionsByActivity(courseId, moduleId, activityId);
                setSubmissions(subs || []);
            } catch (err) {
                console.error("Failed to load submissions:", err);
            }
            setLoading(false);
        };

        load();
    }, [show]);

    // Open grade modal
    const handleOpenGradeModal = (sub: ISubmission) => {
        setSelectedSubmission(sub);
        setGradeText("");  // Always empty when modal opens
        setGradeModalOpen(true);
    };

    const handleSaveGrade = async () => {
        if (!selectedSubmission) return;

        const teacherName = user?.name ?? "Teacher";

        const finalGrade = `✅ Graded by ${teacherName}: ${gradeText}`;

        await updateSubmissionGrade(selectedSubmission._id, finalGrade);

        // Refresh submissions
        const subs = await fetchSubmissionsByActivity(courseId, moduleId, activityId);
        setSubmissions(subs || []);

        setGradeModalOpen(false);
    };

    return (
        <>
            {/* MAIN SUBMISSIONS MODAL */}
            <Modal show={show} onHide={onClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Submissions for {activityName}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {loading ? (
                        <Spinner animation="border" />
                    ) : submissions.length === 0 ? (
                        <p>No submissions yet</p>
                    ) : (
                        <ListGroup>
                            {submissions.map((sub) => (
                                <ListGroup.Item key={sub._id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{sub.studentName}</strong>{" "}
                                        <a
                                            href={`http://localhost:3005${sub.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {sub.fileName}
                                        </a>

                                        {sub.grade && (
                                            <div>
                                                <small className="text-success">{sub.grade}</small>
                                            </div>
                                        )}
                                    </div>

                                    {/* COMMENT / GRADE BUTTON */}
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleOpenGradeModal(sub)}
                                    >
                                        Comment / Grade
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={onClose} variant="secondary">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* GRADE / COMMENT MODAL */}
            <Modal show={gradeModalOpen} onHide={() => setGradeModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Comment / Grade Submission</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Grade / Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={gradeText}
                                onChange={(e) => setGradeText(e.target.value)}
                                placeholder="Enter feedback or grade here..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setGradeModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleSaveGrade}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
