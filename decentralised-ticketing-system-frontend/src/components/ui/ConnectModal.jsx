
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import React, { useState, useEffect } from 'react';
// import { useWeb3React } from '@web3-react/core'
// import { useWeb3React } from "@web3-react/core";
import { GOERLI } from '../../constants/chainIds';
import { connectorHooks, connectors } from '../../utils/connectors';

const connect = async (connector, chainId) => {
  await connector
    .activate(chainId)
    .catch((e) => {
      console.log(`activate error ${e.message}`)
    })
    .then(() => {})
}


function SelectWalletModal() {
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
          <Stack direction="vertical" className="col-md-6 mx-auto" gap={3}>
            <Button variant="light" onClick={() => { 
              connect(connectors['walletConnect'], GOERLI);
              handleClose();
               }}>Wallet Connect</Button>
            <Button variant="light" onClick={() => { 
              connect(connectors['metaMask'], GOERLI);
              handleClose();
               }}>MetaMask</Button>
            <Button variant="light" onClick={() => { 
              console.log("connecting");
              connect(connectors['coinbaseWallet'], GOERLI);
              handleClose();
              }}>Coinbase Wallet</Button>
          </Stack>
        </Modal.Body>
      </Modal>
    </>

  );
}

export default SelectWalletModal;