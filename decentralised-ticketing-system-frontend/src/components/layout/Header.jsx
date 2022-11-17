import React from 'react';
import { useEffect } from 'react';
import SelectWalletModal from '../ui/ConnectModal';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../utils/connectors';
import Stack from 'react-bootstrap/Stack';
function Header() {
  const { active, account, activate, deactivate } = useWeb3React();
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
      <div className="header">
        <div className='d-flex flex-column  align-content-end flex-wrap'>
            {active ?
              <Stack direction="vertical" className="col-md-3" gap={3}>
                <code>{account}</code>
                <Button onClick={disconnect}>Disconnect</Button>
              </Stack>
            : <SelectWalletModal/>
          }
          </div>
      </div>
    </div>
  );
}

export default Header;
