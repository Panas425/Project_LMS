"use client";

interface ModuleActionsProps {
    onActivityClick: () => void;
    onDeleteClick: () => void;
}

export function ModuleActions({ onActivityClick, onDeleteClick }: ModuleActionsProps) {
    return (
        <div className="btn-container">
            <button className="btn-layout" onClick={onActivityClick}>
                Activities
            </button>
            <button onClick={onDeleteClick} className="text-red-500 hover:text-red-700 p-1 rounded">
                <i className="bi bi-trash"></i>
            </button>

        </div>
    );
}
