
import Button from "react-bootstrap/Button"; 
import { useState } from "react";
import { walletConnect } from "../../connectors/WalletConnect";
import { WalletConnect } from "@web3-react/walletconnect";
import { useWeb3React } from '@web3-react/core';

export default function ConnectWallet({
      connector,
      connectorName,
      hooks,
      handleClose
}){ 
    const { useChainId, useAccounts, useIsActivating, useProvider, useENSNames } = hooks
    const [error, setError] = useState();
    const isActivating = useIsActivating();
    const provider = useProvider();
    const ENSNames = useENSNames(provider);
    const chainId = useChainId();
    const accounts = useAccounts();

    return (
    <Button
        variant="light"
        onClick=
        {
            isActivating
            ? undefined
            : () =>
            connector.activate(chainId)

            .then(handleClose())
        }
    >
        {connectorName}
    </Button>
)}