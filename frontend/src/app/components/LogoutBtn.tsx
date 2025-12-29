"use client";

import { ReactElement } from "react";
import { useRouter } from "next/navigation";

import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAuthStore } from "../storesNode/useAuthStoreNode";

export function LogoutBtn(): ReactElement {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    alert("You have logged out");
    router.push("/"); // navigate back to homepage
  };

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip id="logout-tooltip">Click to Log-out</Tooltip>}
    >
      <Button variant="danger" onClick={handleLogout} className="d-flex align-items-center gap-2">
        <span className="material-symbols-rounded">logout</span>
      </Button>
    </OverlayTrigger>
  );
}
