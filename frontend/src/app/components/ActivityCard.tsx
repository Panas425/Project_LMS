"use client";

import { useState, useEffect, useContext } from "react";
import { Button, Card, Form, ListGroup, Spinner } from "react-bootstrap";
import { IActivity, ICourses, IModules, ISubmission } from "../utilsNode";
import { useActivityStore } from "../stores/useActivityStore";
import { Trash } from "react-bootstrap-icons";
import { ActivitySubmissionsModal } from "./ActivitySubmissionsModal";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";

interface IActivityCardProps {
  course: ICourses;
  module: IModules;
  activity: IActivity;
  onActivityDeleted: (activityId: string) => void;
  onActivityAdded: (activity: IActivity) => void;
}

export function ActivityCard({ course, module, activity, onActivityDeleted, onActivityAdded }: IActivityCardProps) {
  const {
    uploadSubmission,
    fetchSubmissionsByActivity,
    deleteSubmission,
    deleteActivity,
    fetchMySubmissionForActivity,
  } = useApiDataStore();
  const { user } = useAuthStore();


  const submissions = useActivityStore((state) => state.submissions);
  const setSubmissions = useActivityStore((state) => state.setSubmissions);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  type ActivitySubmissions = Record<string, ISubmission[]>;

  const [activitySubmissions, setActivitySubmissions] = useState<ActivitySubmissions>({});

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const [studentSubmission, setStudentSubmission] = useState<ISubmission | null>(null);


  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);





  // Load submissions for this activity and user role
  useEffect(() => {
    if (!course?._id || !module?._id || !activity?._id || !user?._id) return;

    setLoading(true);
    const loadSubmissions = async () => {
      try {
        if (isTeacher) {
          const subs = await fetchSubmissionsByActivity(course?._id, module?._id, activity._id);
          setActivitySubmissions(prev => ({ ...prev, [activity._id]: subs }));
        } else if (isStudent) {
          // Fetch only this student's submissions
          const allStudentSubs = await fetchMySubmissionForActivity(user._id);
          const filtered = allStudentSubs.filter(sub => sub.activityId === activity._id);
          setSubmissions(filtered);

          // Set studentSubmission to hide upload if already exists
          setStudentSubmission(filtered[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [
    course?._id,
    module?._id,
    activity?._id,
    user?._id,
    isTeacher,
    isStudent,
    fetchSubmissionsByActivity,
    fetchMySubmissionForActivity,
    setSubmissions,
  ]);



  const loadAllSubmissionsForModule = async () => {
    if (!activity?._id) return;

    try {
      const allSubs = await fetchSubmissionsByActivity(
        course._id,
        module._id,
        activity._id
      );

      const valid = allSubs.filter(sub => sub.fileUrl && sub.fileName);
      setSubmissions(valid);
    } catch (err) {
      // Ignore 404 errors for deleted activities
      if (err instanceof Error && err.message.includes("404")) return;
      console.error(err);
    }
  };


  useEffect(() => {
    if (!activity || !activity._id || !isTeacher) return;
    loadAllSubmissionsForModule();
  }, [activity]);

  function isGraded() {
    return studentSubmission?.grade !== null && studentSubmission?.grade !== undefined;
  }




  const handleUpload = async (studentId: string, studentName: string) => {
    if (!file) return alert("Select a file first");
    if (studentSubmission?.grade) {
      alert("You cannot upload because your submission has already been graded.");
      return;
    }
    setUploading(true);
    console.log(studentSubmission);
    try {
      // 1️⃣ Upload the file
      await uploadSubmission({
        file,
        courseId: course._id,
        activityId: activity._id,
        studentName,
        moduleId: module._id,
        studentId,
      });

      alert("Upload successful!");

      // 2️⃣ Fetch the latest submissions for this activity
      let updatedSubmissions;
      if (isTeacher) {
        if (isTeacher) {
          const updated = await fetchSubmissionsByActivity(course._id, module._id, activity._id);
          setSubmissions(updated);
          setActivitySubmissions(prev => ({ ...prev, [activity._id]: updated }));
        }
      } else {
        const allStudentSubs = await fetchMySubmissionForActivity(studentId);
        updatedSubmissions = allStudentSubs.filter(sub => sub.activityId === activity._id);
        setSubmissions(updatedSubmissions);
        setStudentSubmission(updatedSubmissions[0] || null);
        setFile(null);
      }

      // 3️⃣ Update store and student state


    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };


  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      if (!submissionId) {
        console.error("No submission ID provided");
        return;
      }
      await deleteSubmission(submissionId);
      alert("Submission removed, you can upload again");

      if (isTeacher) {
        const data = await fetchSubmissionsByActivity(course?._id, module._id, activity._id);
        setSubmissions(data);
      } else if (isStudent && user?._id) {
        const updated = await fetchMySubmissionForActivity(user._id);
        const filtered = updated.filter((sub) => sub.activityId === activity._id);
        setSubmissions(filtered);
        setStudentSubmission(filtered[0] || null);

      }
    } catch (err) {
      console.error(err);
      alert("Failed to remove submission");
    }
  };

  const handleDeleteActivity = async () => {
    if (!confirm(`Are you sure you want to delete the activity "${activity.name}"?`)) return;

    setLoading(true);
    try {
      await deleteActivity(course._id, module._id, activity._id);
      alert("Activity deleted successfully");
      onActivityDeleted(activity._id); // Notify parent to update activities list
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title>{activity.name}</Card.Title>
        <Card.Text>{activity.description}</Card.Text>

        {/* Activity Documents */}
        <h6>Activity Documents</h6>
        {activity.documents?.length ? (
          <ul>
            {activity.documents.map((doc) => {
              if (!doc.fileUrl) return null;
              const parts = doc.fileUrl.split("/");
              const fileName = encodeURIComponent(parts.pop()!);
              const filePath = parts.join("/");
              const url = `http://localhost:3005${filePath}/${fileName}`;
              return (
                <li key={doc.id}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {doc.name}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No documents uploaded for this activity</p>
        )}

        {/* Teacher Section */}
        {isTeacher && (
          <div className="mt-3">
            <Button
              variant="info"
              size="sm"
              onClick={() => setShowSubmissionsModal(true)}
            >
              View Submissions
            </Button>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Button
                variant="danger"
                onClick={handleDeleteActivity}
                disabled={loading}
                aria-label={`Delete activity ${activity.name}`}
                size="sm"
                title="Delete Activity"
                style={{ width: '2.5rem', height: '2rem', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <Trash />
              </Button>
            </div>

          </div>

        )}

        {/* Student Section */}
        {isStudent && (
          <div className="mt-3">
            {!studentSubmission ? (
              <>
                <Form.Group controlId={`formFile-${activity._id}`}>
                  <Form.Label>Upload Submission</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => {
                      const input = e.currentTarget as HTMLInputElement;
                      setFile(input.files?.[0] || null);
                    }}
                    disabled={isGraded()} // Disable if already graded
                  />
                </Form.Group>
                <Button
                  onClick={() => handleUpload(user!._id, user.name)}
                  disabled={uploading || !file || isGraded()} // Disable if already graded
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </>
            ) : (
              <>
                <p>
                  You submitted:{" "}
                  <a
                    href={`http://localhost:3005${studentSubmission.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {studentSubmission.fileName}
                  </a>
                </p>

                {studentSubmission.grade && (
                  <p className="text-success">
                    {studentSubmission.grade}
                  </p>
                )}
                {studentSubmission && !studentSubmission.grade && (
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteSubmission(studentSubmission._id)}
                    disabled={!!studentSubmission.grade} // Cannot delete if graded
                  >
                    Remove Submission
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </Card.Body>
      <ActivitySubmissionsModal
        show={showSubmissionsModal}
        onClose={() => setShowSubmissionsModal(false)}
        courseId={course._id}
        moduleId={module._id}
        activityId={activity._id}
        activityName={activity.name}
      />
    </Card>
  );
}
