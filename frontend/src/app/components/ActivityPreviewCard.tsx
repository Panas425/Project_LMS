"use client";

import Link from "next/link";
import { Card } from "react-bootstrap";
import { ISubmission } from "../utilsNode";

export function SubmissionPreviewCard({ submission }: { submission: ISubmission }) {
    const courseId = submission.activity?.moduleId;
    const link = `/studentpage/courses/${courseId}?activity=${submission.activityId}`;

    return (
        <Link href={link} className="text-decoration-none text-dark">
            <Card className="mb-3 p-3 shadow-sm border-0 hover-shadow" style={{ cursor: "pointer" }}>
                <Card.Body>
                    <Card.Title>{submission.activity?.name}</Card.Title>

                    <p className="small text-muted">
                        Submitted file: {submission.fileName}
                    </p>

                    <p className="small text-muted">
                        Due:{" "}
                        {submission.activity?.end
                            ? new Date(submission.activity.end).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "No due date"}
                    </p>

                    {submission.grade && (
                        <p className="text-success fw-bold">
                            Grade: {submission.grade}
                        </p>
                    )}
                </Card.Body>
            </Card>
        </Link>
    );
}
