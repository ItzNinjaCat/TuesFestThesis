import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
// import Profile from '../pages/Profile';
// import Events from '../pages/Events';
import CreateEvent from '../pages/CreateEvent';
import Header from './layout/Header';
import Footer from './layout/Footer';
import useScrollDirection from '../hooks/useScrollDirection';
function App() {
  const scrollDirection = useScrollDirection();
  console.log(scrollDirection)
  return (
    <BrowserRouter>
      <div className="wrapper">
        {scrollDirection !== "down" ? <Header/> : <></>}
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="profile" element={<Profile/>}/>
            <Route path="events" element={<Events/>}/> */}
            <Route path="create-event" element={<CreateEvent/>}/>
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
