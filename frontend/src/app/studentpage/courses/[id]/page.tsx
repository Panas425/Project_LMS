"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "../../../components/Header";
import CourseDetail from "../../../pages/CourseDetail";
import { useAuthStore } from "../../../storesNode/useAuthStoreNode";

export default function StudentCoursePage() {
  const params = useParams();
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // wait for user
    if (user.role !== "student") {
      router.replace("/"); // redirect non-students
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (!courseId) return <p>Invalid course</p>;
  if (!user || loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <CourseDetail courseId={courseId} role="student" />
    </>
  );
}
