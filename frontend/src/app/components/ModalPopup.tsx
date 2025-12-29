"use client";

import React, { ReactElement } from "react";
import { Modal, Button } from "react-bootstrap";
import { AddCourseForm } from "../pages/render/RenderAddCourseForm";


interface ModalPopupProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ModalPopup({ show, setShow }: ModalPopupProps): ReactElement {
  const handleCloseModal = () => {
    setShow(false);
    //window.location.reload();
  };

  return (
    <main>
      <Modal show={show} onHide={handleCloseModal} backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add a New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddCourseForm />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
