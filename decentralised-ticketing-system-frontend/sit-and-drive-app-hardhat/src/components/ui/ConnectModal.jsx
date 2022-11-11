
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import React, { useState } from 'react';

export default function SelectWalletModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
//   const setProvider = (type) => {
//     window.localStorage.setItem("provider", type);
//   };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Connect wallet
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Choose wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>

            <Stack direction="vertical" className="col-md-5 mx-auto" gap={3}>
                <Button variant="light">Metamask</Button>
                <Button variant="light">Metamask</Button>
                <Button variant="light">Metamask</Button>
            </Stack>
        
        </Modal.Body>
      </Modal>
    </>

  );
}
