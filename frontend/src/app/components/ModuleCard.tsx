"use client";

import { ReactElement } from "react";
import { ICourses, IModules } from "../utilsNode";
import { ModuleDetails } from "./ModuleDetails";

import { ActivityModal } from "./ActivityModal";
import { useModuleData } from "../hooks/useModuleData";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";
import { Button } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";

interface IModuleProps {
  course?: ICourses;
  module?: IModules;
  onModuleDeleted?: () => void;
  onModuleAdded?: () => void;
}

export function ModuleCard({ course, module, onModuleDeleted }: IModuleProps): ReactElement {
  const { fetchActivities, deleteModule } = useApiDataStore();
  const { user: user } = useAuthStore();

  const {
    activitiesList,
    showModal,
    showFormModal,
    showVideoModal,
    formatDate,
    setShowModal,
    onActivityBtnClick,
    handleActivitySuccess,
    handleOpenFormModal,
    handleCloseFormModal,
    handleCloseVideoModal,
    handleSubmitForm,
  } = useModuleData(module?._id, course?._id, fetchActivities);

  const handleRemoveModule = async (courseId?: string, moduleId?: string) => {
    if (!courseId || !moduleId) {
      console.log(courseId, moduleId)
      alert("Course or Module ID missing");
      return;
    }

    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      await deleteModule(courseId, moduleId);
      alert("Module deleted successfully");
      if (onModuleDeleted) onModuleDeleted();
    } catch (err) {
      console.error(err);
      alert("Failed to delete module");
    }
  };

  return (
    <>
      <div className="card border p-3 mb-3 w-100">
        {/* Module details */}
        <ModuleDetails module={module!} formatDate={formatDate} />

        {/* Buttons row at the bottom */}
        <div className="mt-3 d-flex justify-content-between">
          {/* Activities button */}
          <Button
            type="button"
            className="btn btn-primary"
            onClick={() => onActivityBtnClick()}
          >
            Activities
          </Button>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            {user?.role === "teacher" && (
              <Button
                variant="danger"
                type="button"
                onClick={() => handleRemoveModule(course?._id, module?._id)}
                aria-label="Delete"
                style={{ width: '2.5rem', height: '2rem', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <Trash />
              </Button>
            )}
          </div>

        </div>
      </div>

      <ActivityModal
        show={showModal}
        onClose={() => setShowModal(false)}
        course={course!}
        module={module!}
        activitiesList={activitiesList}
        user={user!}
        handleOpenFormActivity={handleOpenFormModal}
        showVideoModal={showVideoModal}
        showFormModal={showFormModal}
        handleCloseFormModal={handleCloseFormModal}
        handleCloseVideoModal={handleCloseVideoModal}
        handleSubmitForm={handleSubmitForm}
        handleActivitySuccess={handleActivitySuccess}
      />
    </>
  );
}
