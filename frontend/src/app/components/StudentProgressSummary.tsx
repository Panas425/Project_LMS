"use client";

import { Card } from "react-bootstrap";
import { IUser, ICourses, ISubmission, IUserLoggedIn } from "../utilsNode";

interface Props {
    students: IUser[];
    submissions: ISubmission[];
    courses: ICourses[];
    loading: boolean;
}

export function StudentProgressSummary({ students, submissions, courses, loading }: Props) {
    if (loading) {
        return (
            <Card className="shadow-sm p-3 mb-3">
                <h4 className="fw-bold mb-3">Student Progress Summary</h4>
                <p className="text-muted">Loading...</p>
            </Card>
        );
    }

    const now = new Date();

    // 1️⃣ Inactive students (7+ days)
    const inactiveStudents = students.filter(
        (s) => s.lastLogin && (now.getTime() - new Date(s.lastLogin).getTime()) / (1000 * 3600 * 24) >= 7
    );

    // 2️⃣ Missing Assignments
    const missingAssignments = submissions.filter(
        (sub) =>
            !sub.submittedAt &&
            sub.dueDate &&
            new Date(sub.dueDate) < now
    );

    // 3️⃣ Falling Behind (2+ overdue assignments)
    const fallingBehindStudents = students.filter((student) => {
        const overdueForStudent = missingAssignments.filter(
            (sub) => sub.studentId === student._id
        );
        return overdueForStudent.length >= 2;
    });

    // 4️⃣ Top Performers (all assignments submitted)
    const topPerformers = students.filter((student) => {
        const studentSubs = submissions.filter((s) => s.studentId === student._id);
        return studentSubs.length > 0 && studentSubs.every((s) => s.submittedAt);
    });

    return (
        <Card className="shadow-sm p-3 mb-3">
            <h4 className="fw-bold mb-3">Student Progress Summary</h4>

            <div className="d-flex flex-column gap-3">
                <Card className="p-3 border-0 shadow-sm">
                    <strong>🟡 Falling Behind:</strong> {fallingBehindStudents.length} students
                </Card>

                <Card className="p-3 border-0 shadow-sm">
                    <strong>🔴 Inactive Students:</strong> {inactiveStudents.length} students
                </Card>

                <Card className="p-3 border-0 shadow-sm">
                    <strong>🟠 Missing Assignments:</strong> {missingAssignments.length}
                </Card>

                <Card className="p-3 border-0 shadow-sm">
                    <strong>🟢 Top Performers:</strong> {topPerformers.length}
                </Card>
            </div>
        </Card>
    );
}
