"use client";

import { MouseEventHandler, ReactElement, useState } from "react";
import { RenderCourseList } from "./render/RenderCourseList";
import { ModalPopup } from "../components/ModalPopup";
import { Header } from "../components/Header";

export function TeacherPage(): ReactElement {
  const [showModal, setShowModal] = useState(false);

  const handleOnAddCourse: MouseEventHandler<HTMLButtonElement> = () => {
    setShowModal(true);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen p-4">
        
        {/* Top Header Section */}
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleOnAddCourse}
            >
              + Add Course
            </button>
          </div>

          <ModalPopup show={showModal} setShow={setShowModal} />

          {/* Courses Grid */}
          <div className="row g-4">
            <RenderCourseList />
          </div>
        </div>

      </main>
    </>
  );
}
