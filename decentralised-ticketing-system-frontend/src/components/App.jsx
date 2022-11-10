import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import {useDisclosure} from '@chakra-ui/react';
import Styleguide from '../pages/Styleguide';
import Header from './layout/Header';
import Footer from './layout/Footer';
import SelectWalletModal from "./ui/Modal";
import {Button} from "@chakra-ui/react";
// import { useWeb3React } from "@web3-react/core";
function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <BrowserRouter>
      <div className="wrapper">
        <Header />
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="styleguide" element={<Styleguide />} />
          </Routes>
          <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
        <Button onClick={onOpen}>Connect Wallet</Button>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
