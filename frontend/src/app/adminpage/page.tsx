"use client";

import { AuthGuard } from "../components/AuthGuard";
import { UserListPage } from "../pages";



export default function Page() {
  return <AuthGuard><UserListPage/></AuthGuard>
}