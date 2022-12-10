import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import SelectWalletModal from '../ui/ConnectModal';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../utils/connectors';
import Stack from 'react-bootstrap/Stack';
function Header() {
  const { active, account, activate, deactivate } = useWeb3React();
  const navigate = useNavigate();
  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, [activate]);
  const disconnect = () => {
    window.localStorage.setItem("provider", undefined);
    deactivate();
  };

  return (
    <div className="header-wrapper">
      <div className="header d-flex justify-content-between align-items-center">
        <div classname="d-flex justify-content-evenly">
          <Button onClick={() => navigate("/")}>Home</Button>
          <Button onClick={() => navigate("/events")}>Events</Button>
          <Button onClick={() => navigate("/organizers")}>Organizers</Button>
          <Button onClick={() => navigate("/marketplace")}>Marketplace</Button>
        </div>
        {active ?
          <div classname="d-felx flex-row">
            <div className='d-flex flex-column'>
              <code>{account}</code>
              <code>Balance</code>
              {/* <Button onClick={disconnect}>Disconnect</Button> */}
            </div>
              <Button onClick={() => navigate(`/user/$account`)}>User Profile</Button>
          </div>
          : <SelectWalletModal/>
        }
      </div>
    </div>
  );
}

export default Header;
