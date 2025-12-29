"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "./storesNode/useAuthStoreNode";

export default function HomeRedirect() {
  const router = useRouter();
  const { user: user, isLoggedIn } = useAuthStore(); // your auth state

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login"); // not logged in → go to login
    } else {
      // Redirect based on role
      switch (user?.role) {
        case "teacher":
          router.replace("/teacherpage");
          break;
        case "student":
          router.replace("/mycoursepage");
          break;
        case "admin":
          router.replace("/adminpage");
          break;
        default:
          router.replace("/unauthorized");
          break;
      }
    }
  }, [isLoggedIn, user, router]);
}
