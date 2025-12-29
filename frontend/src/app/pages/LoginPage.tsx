"use client";

import { FormEventHandler, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { RenderLoginPage } from "./render/RenderLoginPage";
import { useAuthStore } from "../storesNode/useAuthStoreNode";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { isLoggedIn, user: user, login, checkToken } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkToken();
      setHydrated(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    console.log(user?._id);
    if (isLoggedIn && user) {
      switch (user.role) {
        case "teacher":
          router.replace("/teacherpage");
          break;
        case "student":
          router.replace("/studentpage");
          break;
        case "admin":
          router.replace("/adminpage");
          break;
        default:
          router.replace("/unauthorized");
      }
    }
  }, [hydrated, isLoggedIn, user, router]);

  const handleOnSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(""); // reset previous error
    try {
      await login(username, password);
    } catch {
      setError("Wrong username or password");
    }
  };


  if (!hydrated) {
    return (
      <main id="login-page" className="g-container">
        <h1 className="h1">University LMS</h1>
        <fieldset>
          <div className="hdr4-container">
            <h4 className="hdr4">Loading...</h4>
          </div>
        </fieldset>
      </main>
    );
  }

  return (
    <RenderLoginPage
      handleOnSubmit={handleOnSubmit}
      password={password}
      setPassword={setPassword}
      setUsername={setUsername}
      username={username}
      error={error}
    />
  );
}
