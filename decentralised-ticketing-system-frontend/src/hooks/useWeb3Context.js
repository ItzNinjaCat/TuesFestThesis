import { createContext, useContext } from 'react';

export const Web3Context = createContext(null);

export const Web3ContextProvider = Web3Context.Provider;

export const useWeb3Context = () => useContext(Web3Context);