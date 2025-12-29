"use client";

import { ReactElement, useContext, useEffect, useState } from "react";

import "../styles/UserListPage.css";

import { RenderUserListPage } from "./render/RenderUserList";
import { ICourses, IUser, ICourseUsers } from "../utilsNode";
import { Header } from "../components/Header";
import { useApiDataStore } from "../storesNode/apiDataStore";
import { useAuthStore } from "../storesNode/useAuthStoreNode";


export function UserListPage(): ReactElement {
  const {
    fetchUsers,
    handleDeleteUser,
    fetchAllCourses,
  } = useApiDataStore();

  const [course, setCourses] = useState<ICourses[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);

useEffect(() => {
  const fetchData = async () => {
    // Wait until tokens are ready
    const tokens = useAuthStore.getState().tokens;
    if (!tokens) {
      console.warn("Skipping API fetch: no tokens yet");
      return;
    }

    const fetchedCourses = await fetchAllCourses();
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
    setCourses(fetchedCourses);
  };

  fetchData();
}, []); // only run once

  return (
    <>
    <Header></Header>
      <RenderUserListPage
        users={users}
        course={course}
        deleteUser={handleDeleteUser}
      />
    </>
  );
}
