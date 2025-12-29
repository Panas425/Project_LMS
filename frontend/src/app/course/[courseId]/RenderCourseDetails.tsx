"use client";

import { useParams } from "next/navigation";
import AttendanceListClient from "./AttendanceListClient";

export default function RenderCourseDetails() {
  const { courseId } = useParams() as { courseId: string };

  if (!courseId) return <p>Course ID not provided</p>;

  return <AttendanceListClient courseId={courseId} />;
}
