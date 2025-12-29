"use client";

import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { AddActivityForm } from "./AddActivityForm";

interface AddActivityModalProps {
  trigger?: React.ReactNode;
  courseId?: string;
  moduleId?: string;
  onSuccess?: () => void;
}

export function AddActivityModal({
  trigger,
  courseId,
  moduleId,
  onSuccess,
}: AddActivityModalProps) {
  const [show, setShow] = useState(false);

  const open = () => setShow(true);
  const close = async () => {
    setShow(false);
    if (onSuccess) await onSuccess();
  };

  return (
    <>
      <span onClick={open} style={{ cursor: "pointer" }}>
        {trigger || <Button>Add Activity</Button>}
      </span>

        <Modal.Body>
          <AddActivityForm
            show={show}
            handleClose={close}
            courseId={courseId || ""}
            moduleId={moduleId || ""}
            onSuccess={() => {
              close();
            }}
          />
        </Modal.Body>

    </>
  );
}
