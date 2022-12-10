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
import useScrollDirection from '../hooks/useScrollDirection';
function App() {
  const scrollDirection = useScrollDirection();
  return (
    <BrowserRouter>
      <div className="wrapper">
        {scrollDirection !== "down" ? <Header/> : <></>}
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="user/:id" element={<UserProfile />} />
            <Route path="organizer/:id" element={<OrganizerProfile />} />
            <Route path="events/:id" element={<Event/>}/>
            <Route path="events" element={<Events/>}/>
            <Route path="create-event" element={<CreateEvent/>}/>
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
