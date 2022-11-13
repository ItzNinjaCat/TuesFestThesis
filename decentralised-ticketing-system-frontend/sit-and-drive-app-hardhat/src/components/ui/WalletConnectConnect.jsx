import { URI_AVAILABLE } from '@web3-react/walletconnect';
import { useEffect } from 'react';
import { hooks, walletConnect } from '../../connectors/WalletConnect';
import ConnectWallet from './ConnectWallet';

export default function WalletConnectConnect(
    props
) {
    // log URI when available
    useEffect(() => {
        walletConnect.events.on(URI_AVAILABLE, (uri) => {
        console.log(`uri: ${uri}`)
        })
    }, [])

    // attempt to connect eagerly on mount
    useEffect(() => {
        walletConnect.connectEagerly().catch(() => {
        console.debug('Failed to connect eagerly to walletconnect')
        })
    }, [])

    return (
        <ConnectWallet
        connector={walletConnect}
        connectorName={"WalletConnect"}
        hooks={hooks}
        {...props}
        />
    )
}
