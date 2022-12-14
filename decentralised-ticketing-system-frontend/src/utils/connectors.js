import { hooks as coinbaseWalletHooks, coinbaseWallet } from './coinbaseWalletConnector';
import { hooks as walletConnectHooks, walletConnect } from './walletConnectConnector';
import { hooks as metaMaskHooks, metaMask } from './metaMaskConnector';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

export const connectorHooks = {
    coinbaseWallet: coinbaseWalletHooks,
    walletConnect: walletConnectHooks,
    metaMask: metaMaskHooks,
};

export const connectors = {
    coinbaseWallet: coinbaseWallet,
    walletConnect: walletConnect,
    metaMask: metaMask,
};

export function getName(connector) {
    if (connector instanceof MetaMask) return 'metaMask';
    if (connector instanceof WalletConnect) return 'walletConnect';
    if (connector instanceof CoinbaseWallet) return 'coinbaseWallet';
    return 'Unknown';
}
