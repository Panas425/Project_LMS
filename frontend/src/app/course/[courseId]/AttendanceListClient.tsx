"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { useApiDataStore } from "../../storesNode/apiDataStore";
import { ICourseUsers } from "../../utilsNode";
import { ModuleCard, StudentCard } from "../../components";
// ❌ Remove this - Grid is an icon, not a layout component
// import { Grid } from "react-bootstrap-icons";
import { AddModuleModal } from "../../components/AddModuleModal";


interface Props {
  courseId: string;
}

export default function AttendanceListClient({ courseId }: Props) {
  const { getCourseByIdFromRouter, saveAttendance } = useApiDataStore();

  const { data: courseData, mutate } = useSWR(
    courseId ? ["course-full", courseId] : null,
    () => getCourseByIdFromRouter(courseId)
  );

  const students: ICourseUsers[] = useMemo(() => {
    if (!courseData?.courseUsers) return [];
    return courseData.courseUsers.map((uc: any) => {
      const attendanceRecord = courseData.attendances?.find(
        (a: any) => a.studentId === uc.studentId
      );
      return {
        studentId: uc.studentId,
        firstName: uc.firstName,
        lastName: uc.lastName,
        courseId: uc.courseId,
        isPresent: attendanceRecord ? attendanceRecord.isPresent : uc.isPresent,
      } as unknown as ICourseUsers;
    });
  }, [courseData]);

  // 🔄 handle module delete and add
  const handleModuleDeleted = async () => {
    await mutate(); // re-fetch course data from backend
  };

  const handleModuleAdded = async () => {
    await mutate(); // refresh after adding module too
  };

  const renderedModules = useMemo(() => {
    if (!courseData?.modules) return null;

    const uniqueModules = Array.from(
      new Map(courseData.modules.map((m) => [m._id, m])).values()
    );

    return uniqueModules.map((module) => (
      <div key={module._id} className="col-sm-4 mb-3">
        <ModuleCard course={courseData} module={module} onModuleDeleted={handleModuleDeleted} onModuleAdded={handleModuleAdded} />
      </div>
    ));
  }, [courseData?.modules]);

  // Attendance logic
  const initialAttendance = useMemo(() => {
    const map: Record<string, boolean> = {};
    students.forEach((s) => {
      map[s._id] = s.isPresent || false;
    });
    return map;
  }, [courseData?.courseUsers]);

  const [attendance, setAttendance] = useState(initialAttendance);

  useEffect(() => {
    setAttendance(initialAttendance);
  }, [initialAttendance]);

  const toggleAttendance = (studentId: string) =>
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }));

  const hasAttendanceChanged = () =>
    Object.keys(attendance).some(
      (key) => attendance[key] !== initialAttendance[key]
    );

  const handleSaveAttendance = async () => {
    if (!hasAttendanceChanged()) return alert("No changes detected.");
    const attendanceList = Object.entries(attendance).map(
      ([studentId, isPresent]) => ({
        studentId,
        isPresent,
        courseId,
        date: new Date().toISOString(),
      })
    );
    try {
      await saveAttendance(courseId, attendanceList);
      alert("Närvarolistan sparad!");
    } catch (err) {
      console.error(err);
      alert("Fel vid sparande av närvaro: " + err);
    }
  };

  if (!courseData) return <p>Loading course...</p>;

  return (
    <main className="home-section">
      <p className="title">{courseData.name}</p>

      {/* Modules Section */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 mb-3">
            <AddModuleModal />
          </div>
          {renderedModules}
        </div>
      </div>

      {/* Students / Attendance Section */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 mb-2">
            <p className="sub-tit">Students - Närvarolista</p>
          </div>

          {students.map((student) => (
            <div
              key={student._id}
              className="col-12 mb-3 d-flex align-items-center"
            >
              <StudentCard
                student={{ name: student.firstName + " " + student.lastName }}
              />
              <input
                type="checkbox"
                checked={attendance[student._id] || false}
                onChange={() => toggleAttendance(student._id)}
                style={{ marginLeft: "auto" }}
              />
            </div>
          ))}

          <div className="col-12 mt-3">
            <button
              className="btn btn-primary"
              onClick={handleSaveAttendance}
              disabled={!hasAttendanceChanged()}
            >
              Spara Närvarolista
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}