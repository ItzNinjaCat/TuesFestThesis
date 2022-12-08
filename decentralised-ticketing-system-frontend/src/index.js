import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './style/style.scss';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { HarperDBProvider } from 'use-harperdb';
const dotenv = require('dotenv');
dotenv.config();
const getLibrary = provider => {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000; // frequency provider is polling
    return library;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
            <HarperDBProvider
                url={process.env.REACT_APP_DB_URL}
                user={process.env.REACT_APP_DB_USER}
                password={process.env.REACT_APP_DB_PASS}
            >
                <App />
            </HarperDBProvider>
        </Web3ReactProvider>
    </React.StrictMode>,
);
