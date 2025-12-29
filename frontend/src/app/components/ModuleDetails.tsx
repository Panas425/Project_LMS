"use client";

import { IModules } from "../utilsNode";

interface ModuleDetailsProps {
  module: IModules;
  formatDate: (dateString: string | undefined) => string;
}

export function ModuleDetails({ module, formatDate }: ModuleDetailsProps) {
  return (
    <div className="mb-3">
      {/* Module Name */}
      <h5 className="fw-bold mb-2 text-truncate">{module?.name}</h5>

      {/* Description */}
      <div className="mb-2">
        <span className="text-muted fw-semibold me-2">Description:</span>
        <span className="text-body">{module?.description || "-"}</span>
      </div>

      {/* Start and End Dates */}
      <div className="d-flex gap-3">
        <div>
          <span className="text-muted fw-semibold me-1">Start:</span>
          <span className="text-body">{formatDate(module?.start)}</span>
        </div>
        <div>
          <span className="text-muted fw-semibold me-1">End:</span>
          <span className="text-body">{formatDate(module?.end)}</span>
        </div>
      </div>
    </div>
  );
}
