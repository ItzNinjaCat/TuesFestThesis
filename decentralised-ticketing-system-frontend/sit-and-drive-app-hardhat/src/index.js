import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './style/style.scss';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { hooks as coinbaseWalletHooks, coinbaseWallet } from './connectors/CoinbaseWallet';
import { hooks as metaMaskHooks, metaMask } from './connectors/MetaMask';
import { hooks as networkHooks, network } from './connectors/Network';
import { hooks as walletConnectHooks, walletConnect } from './connectors/WalletConnect';

function getLibrary(provider) {
  return new Web3Provider(provider);
}
const connectors = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary} connectors={connectors}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>,
);
