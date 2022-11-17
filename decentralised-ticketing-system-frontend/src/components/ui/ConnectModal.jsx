
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core'
import { connectors } from '../../utils/connectors';
// import { useWeb3React } from "@web3-react/core";
export default function SelectWalletModal() {
  const [show, setShow] = useState(false);

  const { activate } = useWeb3React();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const setProvider = (type) => {
    window.localStorage.setItem("provider", type);
  };
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
          <Stack direction="vertical" className="col-md-6 mx-auto" gap={3}>
            <Button variant="light" onClick={() => { 
              activate(connectors.coinbaseWallet);
              setProvider("coinbaseWallet");
              handleClose();
               }}>Coinbase Wallet</Button>
            <Button variant="light" onClick={() => { 
              activate(connectors.walletConnect);
              setProvider("walletConnect");
              handleClose();
               }}>Wallet Connect</Button>
            <Button variant="light"onClick={() => { 
              activate(connectors.injected);
              setProvider("injected");
              handleClose();
              }}>Metamask</Button>
          </Stack>
        </Modal.Body>
      </Modal>
    </>

  );
}
