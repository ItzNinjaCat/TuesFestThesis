import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import UserProfile from '../pages/UserProfile';
import OrganizerProfile from '../pages/OrganizerProfile';
import Events from '../pages/Events';
import Event from '../pages/Event';
import CreateEvent from '../pages/CreateEvent';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Marketplace from '../pages/Marketplace';
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
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="user/:address" element={<UserProfile />} />
            <Route path="organizer/:address" element={<OrganizerProfile />} />
            <Route path="marketplace" element={<Marketplace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
