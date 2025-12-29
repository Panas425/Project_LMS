"use client";

import { AuthGuard } from "../components/AuthGuard";
import { Header } from "../components/Header";
import { TeacherPage } from "../pages";
import CoursesPage from "../pages/CoursesPage";
import TeacherDashboard from "../pages/TeacherDashboard";


export default function Page() {
  return (
    <>
      <Header></Header>
      <AuthGuard >
        <TeacherDashboard />
      </AuthGuard>
    </>
  );
}
