import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import UserProfile from '../pages/UserProfile';
import OrganizerProfile from '../pages/OrganizerProfile';
import Events from '../pages/Events';
import Event from '../pages/Event';
import CreateEvent from '../pages/CreateEvent';
import Header from './layout/Header';
import Marketplace from '../pages/Marketplace';
import useScrollDirection from '../hooks/useScrollDirection';
import { connectorHooks, getName } from '../utils/connectors';
import { useWeb3React } from '@web3-react/core';
import EventDashboard from '../pages/EventDashboard';


function App() {
  const scrollDirection = useScrollDirection();    
  const { connector } = useWeb3React();
  const hooks = connectorHooks[getName(connector)];
  const { useProvider, useAccount } = hooks;
  const provider = useProvider();
  const account = useAccount();
  
  return (
    <BrowserRouter>
      <div className="wrapper">
        {scrollDirection !== "down" ? <Header/> : null}
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="events/:eventId" element={<Event />}/>
            <Route path="events" element={<Events />}/>
            <Route
              path="create-event"
              element={<CreateEvent />} />
            <Route path="user/:address" element={<UserProfile />} />
            <Route path="organizer/:address" element={<OrganizerProfile />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="events/:id/dashboard" element={<EventDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
