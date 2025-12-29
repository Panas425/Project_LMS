"use client";

import { ReactElement, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { AddModuleForm } from "../pages/render/RenderAddModulesForm";
import "bootstrap/dist/css/bootstrap.min.css";

export function ModalAddNewModule(): ReactElement {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* Trigger button */}
      <Button variant="primary" onClick={handleShow}>
        Add New Module
      </Button>

      <Modal
        show={true}
        onHide={handleClose}
        centered
        backdrop="static"
        keyboard={false} 
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Module</Modal.Title>
        </Modal.Header>

          <AddModuleForm onSuccess={handleClose} />

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
