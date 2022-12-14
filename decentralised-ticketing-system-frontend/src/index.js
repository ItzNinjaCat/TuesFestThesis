import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './style/style.scss';
import { Web3ReactProvider } from '@web3-react/core';
import { coinbaseWallet, hooks as coinbaseWalletHooks } from './utils/coinbaseWalletConnector';
import { hooks as metaMaskHooks, metaMask } from './utils/metaMaskConnector';
import { hooks as walletConnectHooks, walletConnect } from './utils/walletConnectConnector';

const dotenv = require('dotenv');
dotenv.config();

const connectors = [
    [metaMask, metaMaskHooks],
    [walletConnect, walletConnectHooks],
    [coinbaseWallet, coinbaseWalletHooks],
];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Web3ReactProvider connectors={connectors}>
            <App />
        </Web3ReactProvider>
    </React.StrictMode>,
);
