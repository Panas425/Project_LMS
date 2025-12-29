// components/ModuleList.tsx
import { ICourses, IModules } from "../utilsNode";
import { ModuleCard } from "./ModuleCard";
import { Suspense } from "react";

interface ModuleListProps {
    course: ICourses;
    modules: IModules[];
    onModuleDeleted?: (deletedModuleId: string) => void;
}

export function ModuleList({ course, modules, onModuleDeleted }: ModuleListProps) {
    if (!modules.length) return <p className="text-muted text-center py-4">No modules yet</p>;

    return (
        <>
            {modules.map((mod) => (
                <ModuleCard
                    key={mod._id}
                    course={course}
                    module={mod}
                    onModuleDeleted={() => onModuleDeleted?.(mod._id)}
                />
            ))}
        </>
    );
}
