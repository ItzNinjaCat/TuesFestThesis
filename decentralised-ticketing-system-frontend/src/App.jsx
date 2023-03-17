import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import OrganizerProfile from './pages/OrganizerProfile';
import Events from './pages/Events';
import Event from './pages/Event';
import CreateEvent from './pages/CreateEvent';
import Header from './components/layout/Header';
import Marketplace from './pages/Marketplace';
import EventDashboard from './pages/EventDashboard';
import EditEvent from './pages/EditEvent';
import Tickets from './pages/Tickets';
import UseTicket from './pages/UseTicket';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from './utils/connectors';
import { TICKET_ADDRESS, TIK_ADDRESS } from './constants/constants';
import TICKET_ABI from './constants/abis/ticketGenerator.json';
import TIK_ABI from './constants/abis/TIK.json';
import { getContract } from './utils/utils';
import useBalance from './hooks/useBalance';
import { Web3ContextProvider } from './hooks/useWeb3Context';
import { Configuration, OpenAIApi } from "openai";

function App() {
  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const [balanceUpdate, setBalanceUpdate] = useState(false);
  const { connector } = useWeb3React();
  const hooks = connectorHooks[getName(connector)];
  const { useAccount, useAccounts, useIsActive, useProvider } = hooks;
  const provider = useProvider();
  const account = useAccount();
  const isActive = useIsActive();
  const accounts = useAccounts();
  const tokenContract = getContract(TIK_ADDRESS, TIK_ABI.abi, provider, account);
  const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);
  const balance = useBalance(
    isActive,
    provider,
    account,
    tokenContract,
    balanceUpdate,
    setBalanceUpdate,
  );
  return (
    <Web3ContextProvider
      value={{
        connector,
        provider,
        account,
        isActive,
        accounts,
        tokenContract,
        contract,
        balance,
        setBalanceUpdate,
        openai,
      }}
    >
      <BrowserRouter>
        <div className="wrapper">
          <Header />
          <div className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="events/:eventId" element={<Event />} />
              <Route path="events" element={<Events />} />
              <Route path="create-event" element={<CreateEvent />} />
              <Route path="user/:address" element={<UserProfile />} />
              <Route path="organizer/:address" element={<OrganizerProfile />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="events/:id/dashboard" element={<EventDashboard />} />
              <Route path="events/:id/edit" element={<EditEvent />} />
              <Route path="events/:id/tickets/edit" element={<Tickets />} />
              <Route path="use/:ownerHash/:id" element={<UseTicket />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </Web3ContextProvider>
  );
}
export default App;
