import React, { useState, useRef } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Draggable from 'react-draggable';
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
import { Configuration, OpenAIApi } from 'openai';
import chatSupport from './assets/chat-support.png';
function App() {
  const ref = useRef(null);
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
  console.log(ref);
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
          <div className="main" ref={ref}>
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
          <Draggable
            // grid={[100, 100]}
            bounds="parent"
            offsetParent={ref.current}
          >
            <Button
              className="rounded-circle position-absolute bottom-0 end-0 my-5 mx-5"
              onClick={() => {
                console.log('egere');
              }}
            >
              <img src={chatSupport} />
            </Button>
          </Draggable>
        </div>
      </BrowserRouter>
    </Web3ContextProvider>
  );
}
export default App;

// <svg
//   xmlns="http://www.w3.org/2000/svg"
//   width="19"
//   height="20"
//   fill="none"
//   viewBox="0 0 19 20"
//   svg-inline=""
//   role="presentation"
//   focusable="false"
//   tabindex="-1"
//   class="kz-icon-xs icon--opacity-xl-full icon--stroke--white-snow icon--stroke--white-snow"
// >
//   <path
//     stroke="#48576F"
//     stroke-linecap="round"
//     stroke-linejoin="round"
//     stroke-width="1.5"
//     d="M16.111 12.676v.486a5.928 5.928 0 01-1.66 4.128A5.584 5.584 0 0110.444 19M2.89 7.81c0-1.806.696-3.538 1.936-4.815A6.514 6.514 0 019.5 1c1.753 0 3.435.718 4.675 1.995A6.917 6.917 0 0116.11 7.81m-12.75 0v4.865H1.944a.93.93 0 01-.667-.285.988.988 0 01-.277-.688v-2.92c0-.257.1-.505.277-.687a.93.93 0 01.667-.285h1.417zM18 8.784v2.919c0 .258-.1.505-.277.688a.93.93 0 01-.667.285h-1.417V7.81h1.417c.25 0 .49.102.667.285.178.182.277.43.277.688z"
//   ></path>
// </svg>;
