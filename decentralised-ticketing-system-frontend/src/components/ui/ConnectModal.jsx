
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import React, { useState } from 'react';
import { WalletConnectConnect } from './WalletConnectConnect';
import { MetaMaskConnect } from './MetaMaskConnect';
import { CoinbaseWalletConnect } from './CoinbaseWalletConnect';
// import { useWeb3React } from "@web3-react/core";
export default function SelectWalletModal() {
  const [show, setShow] = useState(false);


  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


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
            <MetaMaskConnect
              handleClose={handleClose}
            />
            <WalletConnectConnect
            handleClose={handleClose}
            />
            <CoinbaseWalletConnect
            handleClose={handleClose}
            />
          </Stack>
        </Modal.Body>
      </Modal>
    </>

  );
}
