"use client";

import { Modal, Button } from "react-bootstrap";
import { ActivityListPage } from "../pages/ActivityListPage";
import { IActivity, ICourses, IModules, IUserLoggedIn } from "../utilsNode";
import { useActivities } from "../hooks/useActivities";
import { AddActivityForm } from "./AddActivityForm";
import { useEffect, useState } from "react";

interface ActivityModalProps {
  show: boolean;
  onClose: () => void;
  module: IModules;
  course: ICourses;
  activitiesList: IActivity[];
  user: IUserLoggedIn;
  handleOpenFormActivity: () => void;
  handleCloseFormModal: () => void;
  showVideoModal: boolean;
  showFormModal: boolean;
  handleCloseVideoModal: () => void;
  handleActivitySuccess: () => void;
  handleSubmitForm: (moduleId: string) => Promise<void>;

}

export function ActivityModal({
  show,
  onClose,
  module,
  course,
  activitiesList,
  user,
  showFormModal,
  handleCloseFormModal,
  handleOpenFormActivity,
  handleActivitySuccess,
}: ActivityModalProps) {

  const { mutate } = useActivities(course._id, module._id);
  const [localActivities, setLocalActivities] = useState<IActivity[]>(activitiesList);

  useEffect(() => {
    setLocalActivities(activitiesList);
  }, [activitiesList]);






  return (
    <Modal show={show} onHide={onClose} backdrop={false} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{module?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ActivityListPage
          course={course}
          module={module}
          activityList={localActivities}
          message="No activities available"
          onDeleteSuccess={handleActivitySuccess}
        />

        {user?.role === "teacher" && (
          <div className="d-flex flex-column gap-2 mt-3">
            <Button
              variant="primary"
              onClick={handleOpenFormActivity}
              style={{ width: "120px" }}
            >
              Add Activity
            </Button>
            <AddActivityForm
              show={showFormModal}
              handleClose={handleCloseFormModal}
              courseId={course._id}
              moduleId={module!._id}
              onSuccess={(newActivity) => {
                mutate((prev: IActivity[] | undefined) => [newActivity, ...(prev ?? [])], false);
                handleCloseFormModal();
              }}
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
