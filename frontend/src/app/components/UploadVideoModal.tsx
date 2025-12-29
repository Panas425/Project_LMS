"use client";


import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useApiDataStore } from "../storesNode/apiDataStore";

interface UploadVideoModalProps {
    moduleId: string;
    show: boolean;
    handleClose: () => void;
    onUploadSuccess: () => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ moduleId, onUploadSuccess }) => {
    const { uploadModuleVideo, fetchModuleVideos } = useApiDataStore(); // Use module method
    const [show, setShow] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [videos, setVideos] = useState<any[]>([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setVideoFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!videoFile || !title) return alert("Please fill all fields");

        setUploading(true);
        try {
            await uploadModuleVideo({ moduleId, title, file: videoFile, description });

            await onUploadSuccess(); // ✅ tell parent to refresh videos
            handleClose(); // close modal after successful upload
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };


    useEffect(() => {
        if (show) {
            (async () => {
                const initialVideos = await fetchModuleVideos(moduleId);
                setVideos(initialVideos);
            })();
        }
    }, [show, moduleId]);
    useEffect(() => {
        fetchModuleVideos(moduleId);
    }, []);


    return (
        <>
            <Button
                variant="primary"
                onClick={handleShow}
                style={{ width: '130px' }} // set any width you want
            >
                Upload Video
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Module Video</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={uploading} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Select Video File</Form.Label>
                            <Form.Control type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={uploading}>Cancel</Button>
                    <Button variant="success" onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
