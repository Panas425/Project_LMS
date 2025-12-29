import { ReactElement, useContext, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useApiDataStore } from "../../storesNode/apiDataStore";


interface RenderAddSubmissionFormProps {
  show: boolean;
  handleClose: () => void;
  activityId: string;
  onSuccess: () => void;
}

export function RenderAddSubmissionForm({
  show,
  handleClose,
  activityId,
  onSuccess,
}: RenderAddSubmissionFormProps): ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [deadline, setDeadline] = useState<string>("");

  const { uploadSubmission } = useApiDataStore();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file before submitting.");
      return;
    }

    try {
      /*await uploadSubmission({
        file,
        activityId,
        deadline: deadline ? new Date(deadline) : null,
      });*/

      onSuccess(); // Notify parent (e.g., refresh submissions)
      handleClose(); // Close modal
    } catch (error) {
      console.error("Error uploading submission:", error);
      alert("Failed to upload submission.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Upload Submission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleFormSubmit}>

          <Form.Group controlId="formDeadline" className="mt-3">
            <Form.Label>Deadline (optional)</Form.Label>
            <Form.Control
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="ms-2">
              Upload
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
