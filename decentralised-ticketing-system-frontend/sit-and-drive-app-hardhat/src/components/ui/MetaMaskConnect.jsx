import { useEffect } from 'react';
import { hooks, metaMask } from '../../connectors/MetaMask';
import ConnectWallet from './ConnectWallet';

export default function MetaMaskConnect(
    props
) {
    useEffect(() => {
        metaMask.connectEagerly().catch(() => {
        console.debug('Failed to connect eagerly to metamask')
        })
    }, [])
    return (
        <ConnectWallet
        connector={metaMask}
        connectorName={"MetaMask"}
        hooks={hooks}
        {...props}
        />
    )
}
