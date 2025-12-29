"use client";

import { useState, useEffect } from "react";
import { IActivity, IDocument } from "../utilsNode";

export function useModuleData(
  moduleId: string | undefined,
  courseId: string | undefined,
  fetchActivities: (courseId: string, moduleId: string) => Promise<IActivity[]>,
) {
  const [activitiesList, setActivityList] = useState<IActivity[]>([]);
  const [videos, setVideos] = useState<IDocument[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);


  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("se-SE", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };


  const onActivityBtnClick = async () => {
    if (!moduleId || !courseId) return;
    const fetchedActivities = await fetchActivities(courseId, moduleId);
    setActivityList(fetchedActivities || []);
    setShowModal(true);
  };

  const handleActivitySuccess = async () => {
    if (!moduleId || !courseId) return;
    const refreshedActivities = await fetchActivities(courseId, moduleId);
    setActivityList(refreshedActivities || []);
  };

  const handleOpenFormModal = () => setShowFormModal(true);

  const handleCloseFormModal = async () => {
    if (!moduleId || !courseId) return;
    await fetchActivities(courseId, moduleId);
    setShowFormModal(false);
  };

  const handleCloseVideoModal = async () => {
    if (!moduleId || !courseId) return;
    await fetchActivities(courseId, moduleId);
    setShowVideoModal(false);
  };


  const handleSubmitForm = async (moduleID: string) => {
    if (!moduleId || !courseId) return;
    await fetchActivities(courseId, moduleID);
    setActivityList((await fetchActivities(courseId, moduleID)) || []);
    setShowFormModal(false);
  };



  return {
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
  };
}
