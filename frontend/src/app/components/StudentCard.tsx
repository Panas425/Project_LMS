"use client";

import { ReactElement } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface IStudentProps {
  student: {
    name: string;
  };
}

export function StudentCard({ student }: IStudentProps): ReactElement {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body d-flex align-items-center">
        {/* Avatar placeholder */}
        <div
          className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
          style={{
            width: 50,
            height: 50,
            fontWeight: "bold",
            fontSize: "1.25rem",
          }}
          aria-label={`Avatar for ${student.name}`}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>

        {/* Student info */}
        <div className="flex-grow-1">
          <h5 className="card-title mb-1">{student.name}</h5>
        </div>

        {/* Optional: action buttons (e.g. message) */}
        {/* <button className="btn btn-outline-primary btn-sm">Message</button> */}
      </div>
    </div>
  );
}
