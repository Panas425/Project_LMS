"use client";

import { ReactElement } from "react";
import { ActivityCard } from "../components/ActivityCard";
import { IActivity, ICourses, IModules } from "../utilsNode";
import { useActivities } from "../hooks/useActivities";


interface IActivityProps {
  course: ICourses;
  module: IModules;
  activityList: IActivity[];
  message: string;
  onDeleteSuccess?: () => void;
}

export function ActivityListPage({
  course,
  module,
  activityList,
  onDeleteSuccess,
  message
}: IActivityProps): ReactElement {

  const { data: activities, mutate } = useActivities(course._id, module._id);

  const handleActivityDeleted = async (deletedActivityId: string) => {
    mutate(
      (prev: IActivity[] | undefined) =>
        prev?.filter((a) => a._id !== deletedActivityId),
      false
    );

    onDeleteSuccess?.();
  };

  const handleActivityAdded = async (newActivity: IActivity) => {
    mutate((prev: IActivity[] | undefined) => [newActivity, ...(prev ?? [])], false);
  };

  if (!activities) return <p>Loading...</p>;
  if (activities.length === 0) return <p>{message}</p>;

  return (
    <>
      {activities.map((activity: IActivity) => (
        <ActivityCard
          key={activity._id}
          course={course}
          module={module}
          activity={activity}
          onActivityDeleted={handleActivityDeleted}
          onActivityAdded={handleActivityAdded}
        />
      ))}
    </>
  );
}
