"use client";

import React from "react";

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  description: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline(props: TimelineProps) {
  const { events } = props;

  return (
    <div
      className="timeline-container p-3 border rounded shadow-sm"
      style={{ maxHeight: "400px", overflowY: "auto" }}
    >
      <ul className="timeline list-unstyled m-0 p-0">
        {events.map((event) => (
          <li key={event.id} className="mb-3">
            <div className="d-flex align-items-start">
              <div
                className="timeline-dot me-3 mt-1"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#0d6efd",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div>
                <p className="mb-1">{event.description}</p>
                <small className="text-muted">
                  {event.timestamp.toLocaleString("se-SE", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
