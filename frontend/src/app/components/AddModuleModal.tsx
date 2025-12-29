"use client";

import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { AddModuleForm } from "../pages/render/RenderAddModulesForm";

interface AddModuleModalProps {
  trigger?: React.ReactNode;     // custom button or link
  courseId?: string;             // optional (can be chosen inside form)
  onSuccess?: () => void;
}

export function AddModuleModal({
  trigger,
  courseId,
  onSuccess
}: AddModuleModalProps) {
  const [show, setShow] = useState(false);

  const open = () => setShow(true);
  const close = async () => {
    setShow(false);
    if (onSuccess) await onSuccess();
  };

  return (
    <>
      {/* Trigger Button */}
      <span onClick={open} style={{ cursor: "pointer" }}>
        {trigger || <Button>Add Module</Button>}
      </span>

      {/* Modal */}
      <Modal show={show} onHide={close} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add Module</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddModuleForm onSuccess={close} courseId={courseId} />
        </Modal.Body>
      </Modal>
    </>
  );
}
