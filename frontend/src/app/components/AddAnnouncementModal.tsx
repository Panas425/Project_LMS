"use client";

import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";

interface AddAnnouncementModalProps {
    show: boolean;
    handleClose: () => void;
    onSuccess?: () => void;
}

export function AddAnnouncementModal({ show, handleClose, onSuccess }: AddAnnouncementModalProps) {
    const { myCourses, fetchRecentAnnouncements, createAnnouncement } = useApiDataStore();
    const { user } = useAuthStore();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [courseId, setCourseId] = useState(""); // optional
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setIsSubmitting(true);

        try {

            await createAnnouncement(
                title,
                message,
                user?._id!,
                courseId || ""
            );



            alert("Announcement created successfully!");
            setTitle("");
            setMessage("");
            setCourseId("");

            if (!user?._id) {
                alert("User not loaded yet");
                return;
            }
            await fetchRecentAnnouncements();

            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create announcement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Announcement</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Course (optional)</Form.Label>
                        <Form.Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                            <option value="">-- General Announcement --</option>
                            {myCourses.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Submit"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
