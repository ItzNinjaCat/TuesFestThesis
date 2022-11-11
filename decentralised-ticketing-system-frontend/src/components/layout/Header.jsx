import React from 'react';
// import useProvider from '../../hooks/useProvider';
import Button from "../ui/Button";
import SelectWalletModal from "../ui/Modal";
import {useDisclosure} from '@chakra-ui/react';
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {connectors} from "../utils/Connectors"
function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
    const {
    library,
    chainId,
    account,
    activate,
    deactivate,
    active
  } = useWeb3React();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  return (
    <div className="header-wrapper">
      <div className="header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <p>🔥</p>
            {
              !active ? (
                <Button onClick={onOpen}>Connect Wallet</Button>
              ) : (
                <Button onClick={disconnect}>Disconnect</Button>
              )}
          </div>
          <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
        </div>
      </div>
    </div>
  );
}

export default Header;
