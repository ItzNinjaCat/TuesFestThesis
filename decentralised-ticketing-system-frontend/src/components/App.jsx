import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Events from '../pages/Events';
import Header from './layout/Header';
import Footer from './layout/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="wrapper">
        <Header />
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="profile" element={<Profile/>}/>
            <Route path="events" element={<Events/>}/>
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
