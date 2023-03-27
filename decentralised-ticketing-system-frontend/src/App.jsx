import React, { useEffect, useState } from 'react';
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
import { Configuration, OpenAIApi } from 'openai';
import { Widget, addResponseMessage, addUserMessage, deleteMessages } from 'react-chat-widget';

import md5 from 'md5';
import 'react-chat-widget/lib/styles.css';

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

  useEffect(() => {
    if (!account) {
      return;
    }
    const messages = JSON.parse(localStorage.getItem('messages'));
    if (messages !== null) {
      console.log(messages);
      messages[account]?.forEach(message => {
        if (message.role === 'user') {
          addUserMessage(message.content);
        } else {
          addResponseMessage(message.content);
        }
      });
    }
  }, [account]);

  const handleNewUserMessage = newMessage => {
    console.log(`New message incoming! ${newMessage}`);
    let msgs = JSON.parse(localStorage.getItem('messages'));
    if (msgs === null) {
      msgs = [{ content: newMessage, role: 'user' }];
    } else {
      msgs = [...msgs[account], { content: newMessage, role: 'user' }];
    }
    console.log(msgs);
    // Now send the message throught the backend API
    openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              "You are a chatbot embedded inside a decentralised ticketing system website. Your job is to help users by answering their questions about events, tickets, decentralisation, web3 and other topics related to this website. You can ask questions to the user, but you cannot ask questions to other chatbots. Here's aquick description of the website so you can assist user navigation. This website consist of a few pages. At first the user opens the Home page. It cosists of a list of the last 20 events and a header. The header is present on all pages. It contains links that can be used to naivgate the site. The links are : Events, Marketplace, Create Event, Your Events. The Create event and Your event links are only visible to organizers. To become an organizer a user first must deposit 0.001 ETH and them press the become organizer button present in the header. In order to be able to do that though the user must first connect a web3 wallet. This can be achieved from the Connect Wallet button in the header. It opens a modal that presents the user with 3 options for connection a wallet: WalletConnect, Coinbase Wallet and Metamask. After connection a wallet the user can also access their profile via the profile icon button on the right side of their address. Users can purchase tickets for events by opening the event's page by clicking on a given event's card. Tickets can also be gifted. A user can use their tickets by presenting an organizer with the QR code provided when they click of the ticket card in their profile page. After successfully using a ticket the users can get a souvenir from it. This can be done by going over to their profile, clicking on the Used(No souvenir) tab and selecting the ticket. In the modla that opens there should be a Get Souvenir button. After that the user can view their souvenir in the souvenirs tab of their profile. Organizer can view statistics about their events by opening the Your events page and clicking on an event card. This will redirect them to an Event dashboard page that show staticstics of this event and enables them to update it's information. A user's tickets are only accessable trough their profile page. To get there a user needs to click on the profile icon next to their wallet address. Please use these descriptions to help users.",
          },
          ...msgs,
        ],
      })
      .then(res => {
        addResponseMessage(res.data.choices[0].message.content);
        msgs = [...msgs, { content: res.data.choices[0].message.content, role: 'assistant' }];
        console.log();
        localStorage.setItem('messages', JSON.stringify({ [account]: msgs }));
      });
  };
  window?.ethereum?.on('accountsChanged', function (accounts) {
    deleteMessages(localStorage.getItem('messages')[accounts[1]]?.length);
  });

  const handleToggle = status => {
    console.log(status);
    if (status === false) {
      return;
    }
    const messages = JSON.parse(localStorage.getItem('messages'));
    if (messages !== null) {
      return;
    }
    openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              "You are a chatbot embedded inside a decentralised ticketing system website. Your job is to help users by answering their questions about events, tickets, decentralisation, web3 and other topics related to this website. You can ask questions to the user, but you cannot ask questions to other chatbots. Here's aquick description of the website so you can assist user navigation. This website consist of a few pages. At first the user opens the Home page. It cosists of a list of the last 20 events and a header. The header is present on all pages. It contains links that can be used to naivgate the site. The links are : Events, Marketplace, Create Event, Your Events. The Create event and Your event links are only visible to organizers. To become an organizer a user first must deposit 0.001 ETH and them press the become organizer button present in the header. In order to be able to do that though the user must first connect a web3 wallet. This can be achieved from the Connect Wallet button in the header. It opens a modal that presents the user with 3 options for connection a wallet: WalletConnect, Coinbase Wallet and Metamask. After connection a wallet the user can also access their profile via the profile icon button on the right side of their address. Users can purchase tickets for events by opening the event's page by clicking on a given event's card. Tickets can also be gifted. A user can use their tickets by presenting an organizer with the QR code provided when they click of the ticket card in their profile page. After successfully using a ticket the users can get a souvenir from it. This can be done by going over to their profile, clicking on the Used(No souvenir) tab and selecting the ticket. In the modla that opens there should be a Get Souvenir button. After that the user can view their souvenir in the souvenirs tab of their profile. Organizer can view statistics about their events by opening the Your events page and clicking on an event card. This will redirect them to an Event dashboard page that show staticstics of this event and enables them to update it's information. A user's tickets are only accessable trough their profile page. To get there a user needs to click on the profile icon next to their wallet address. Please use these descriptions to help users.",
          },
        ],
      })
      .then(res => {
        addResponseMessage(res.data.choices[0].message.content);
        const msgs = [{ content: res.data.choices[0].message.content, role: 'assistant' }];
        console.log(JSON.stringify({ [account]: msgs }));
        localStorage.setItem('messages', JSON.stringify({ [account]: msgs }));
      });
  };

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
          {account && (
            <Widget
              emojis={true}
              handleNewUserMessage={handleNewUserMessage}
              title="Get help"
              subtitle={false}
              showBadge={false}
              handleToggle={handleToggle}
              profileClientAvatar={`https://www.gravatar.com/avatar/${md5(account)}/?d=identicon`}
            />
          )}
        </div>
      </BrowserRouter>
    </Web3ContextProvider>
  );
}
export default App;
