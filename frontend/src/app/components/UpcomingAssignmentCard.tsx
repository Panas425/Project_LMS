"use client";

import React from "react";
import { Button, Card } from "react-bootstrap";
import { IActivity, IUpcomingAssignment } from "../utilsNode";
interface UpcomingAssignmentsProps {
    loading: boolean;
    upcomingAssignments: IUpcomingAssignment[];
}

export const UpcomingAssignments: React.ComponentType<UpcomingAssignmentsProps> = ({
    loading,
    upcomingAssignments,
}) => {
    return (
        <div className="card shadow-sm w-50">
            <div className="card-header bg-white">
                <h4 className="fw-bold mb-0">Upcoming Assignments</h4>
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : upcomingAssignments.length > 0 ? (
                    upcomingAssignments.map((assignment) => (
                        <Card key={assignment._id} className="mb-3 p-3 shadow-sm border-0">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <h5 className="fw-semibold">{assignment.name}</h5>
                                </div>
                                <p className="small text-muted">{assignment.courseName}</p>
                                <p className="small text-muted">
                                    Due:{" "}
                                    {assignment.end
                                        ? new Date(assignment.end).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "No due date"}
                                </p>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted text-center py-4">No upcoming assignments</p>
                )}
            </div>
        </div>

    );
};
