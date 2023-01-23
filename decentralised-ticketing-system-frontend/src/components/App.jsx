import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import UserProfile from '../pages/UserProfile';
import OrganizerProfile from '../pages/OrganizerProfile';
import Events from '../pages/Events';
import Event from '../pages/Event';
import CreateEvent from '../pages/CreateEvent';
import Header from './layout/Header';
import Marketplace from '../pages/Marketplace';
import EventDashboard from '../pages/EventDashboard';
import EditEvent from '../pages/EditEvent';
import Tickets from '../pages/Tickets';
import useScrollDirection from '../hooks/useScrollDirection';


function App() {
  const scrollDirection = useScrollDirection();
  
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
            <Route path="events/:id/edit" element={<EditEvent />} />
            <Route path="events/:id/tickets/edit" element={<Tickets />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
