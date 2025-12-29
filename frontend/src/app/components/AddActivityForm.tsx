"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { IActivity } from "../utilsNode";
import { error } from "node:console";

interface RenderAddActivitiesFormProps {
  show: boolean;
  handleClose: () => void;
  courseId: string;
  moduleId: string;
  onSuccess?: (newActivity: IActivity) => void;
}

export function AddActivityForm({
  show,
  handleClose,
  courseId: initialCourseId,
  moduleId: initialModuleId,
  onSuccess,
}: RenderAddActivitiesFormProps) {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState<"Assignment" | "Quiz" | "Lecture" | "Lab" | "Project">("Assignment");
  const [documents, setDocuments] = useState<File[]>([]);
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modules, setModules] = useState<{ _id: string; name: string }[]>([]);


  const { createActivity, uploadActivityDocument, myCourses } = useApiDataStore();
  const [courseId, setCourseId] = useState(initialCourseId || "");
  const [moduleId, setModuleId] = useState(initialModuleId || "");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setModuleId("");
      return;
    }

    // Find selected course from myCourses
    const selectedCourse = myCourses.find((c) => c._id === courseId);
    if (selectedCourse?.modules) {
      setModules(selectedCourse.modules);
      if (!initialModuleId) setModuleId(""); // reset module if no initialModuleId
    }
  }, [courseId, myCourses, initialModuleId]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);





    try {
      // Keep deadline as string
      const activityDetails = {
        name,
        description,
        activityType,
        start: deadline,  // string from <input type="date">
        end: deadline,    // string from <input type="date">
        moduleId,
      };

      const newActivity = await createActivity(courseId, moduleId, activityDetails);
      console.log(moduleId)
      if (newActivity?._id && documents.length > 0) {
        for (const doc of documents) {
          await uploadActivityDocument({
            courseId,
            moduleId,
            file: doc,
            activityId: newActivity._id,
            deadline: deadline ? new Date(deadline) : null,
          });
        }
      }

      onSuccess?.(newActivity);
      handleClose();

      // Reset form
      setName("");
      setDescription("");
      setActivityType("Assignment");
      setDocuments([]);
      setDeadline("");
      if (!initialCourseId) setCourseId("");
      if (!initialModuleId) setModuleId("");

    } catch (error) {
      setError("Failed to create activity. Please try again.");

    } finally {
      setIsSubmitting(false);
    }
  };




  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Activity</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit} className="p-3">
          {error && <p className="text-danger">{error}</p>}

          {/* Course dropdown if not passed */}
          {!initialCourseId && (
            <div className="form-group mb-3">
              <label>Course</label>
              <select
                className="form-select"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                <option value="">-- Select Course --</option>
                {myCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Module dropdown if course selected */}
          {courseId && !initialModuleId && (
            <div className="form-group mb-3">
              <label>Module</label>
              <select
                className="form-select"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                required
              >
                <option value="">-- Select Module --</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          


          <Form.Group className="mb-3">
            <Form.Label>Activity Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Activity Type</Form.Label>
            <Form.Select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as "Assignment" | "Quiz" | "Lecture" | "Lab" | "Project")}

            >
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab</option>
              <option value="Project">Project</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload Documents</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                setDocuments((prev) => [...prev, ...files]);
              }}
            />
            {documents.length > 0 && (
              <ul className="mt-2">
                {documents.map((doc, idx) => (
                  <li key={idx} className="d-flex justify-content-between align-items-center">
                    {doc.name}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setDocuments((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
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
