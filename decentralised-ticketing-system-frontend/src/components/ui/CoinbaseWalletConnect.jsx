import { useEffect } from 'react';
import { hooks, coinbaseWallet } from '../../connectors/CoinbaseWallet';
import ConnectWallet from './ConnectWallet';

export function CoinbaseWalletConnect(
    props
) {

  // attempt to connect eagerly on mount
  useEffect(() => {
    void coinbaseWallet.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to coinbase wallet')
    })
  }, [])


    return (
        <ConnectWallet
        connector={coinbaseWallet}
        connectorName={"Coinbase Wallet"}
        hooks={hooks}
        {...props}
        />
    )
}
