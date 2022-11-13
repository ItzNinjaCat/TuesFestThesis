
import Button from "react-bootstrap/Button"; 
import { useState } from "react";



export default function ConnectWallet({
      connector,
      connectorName,
      hooks,
      handleClose
}){ 
    const { useChainId, useAccounts, useIsActivating, useProvider, useENSNames } = hooks
    const setError = useState();
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
            .then(() => setError(undefined))
            .catch(setError)
            .then(handleClose())
        }
    >
        {connectorName}
    </Button>
)}