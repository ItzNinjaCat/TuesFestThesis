import React from 'react';
// import useProvider from '../../hooks/useProvider';
import Button from "react-bootstrap/Button";
import SelectWalletModal from '../ui/ConnectModal';
import useProvider from '../../hooks/useProvider';
import { useWeb3React } from '@web3-react/core';
import { URLS } from '../../utils/chains';
function Header() {
  // const provider = useProvider();
  console.log(URLS);
  const { active, chainId, account } = useWeb3React();
  const disconnect = () => {
    console.log("disconnect here");
  };

  return (
    <div className="header-wrapper">
      <div className="header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <p>🔥</p>
            {/* {provider ?
            <>
              <p><code>{provider.signerData.userAddress}</code></p>
              <Button onClick={disconnect}>Disconnect</Button>
            </>
            : } */}
            <SelectWalletModal/>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
