import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style/style.scss';
import { Web3ReactProvider } from '@web3-react/core';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { coinbaseWallet, hooks as coinbaseWalletHooks } from './utils/coinbaseWalletConnector';
import { hooks as metaMaskHooks, metaMask } from './utils/metaMaskConnector';
import { hooks as walletConnectHooks, walletConnect } from './utils/walletConnectConnector';
import { SUBGRAPH_URL } from './constants/contracts';

const connectors = [
    [metaMask, metaMaskHooks],
    [walletConnect, walletConnectHooks],
    [coinbaseWallet, coinbaseWalletHooks],
];
const client = new ApolloClient({
    cache: new InMemoryCache(
        {
            typePolicies: {
                fields: {
                    offers: {
                        keyArgs: ["buyer", "seller"],
                    },
                    tickets: {
                        keyArgs: ["owner"],
                    },
                    souvenirs: {
                        keyArgs: ["owner"],
                    },
                    organizers: {
                        keyArgs: ["account"],
                    },
                },
            },
        }
    ),
    uri: SUBGRAPH_URL,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Web3ReactProvider connectors={connectors}>
            <ApolloProvider client={client}>
                <App />
            </ApolloProvider>
        </Web3ReactProvider>
    </React.StrictMode>,
);
