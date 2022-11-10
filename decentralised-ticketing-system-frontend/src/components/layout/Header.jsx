import React from 'react';
import useProvider from '../../hooks/useProvider';

function Header() {
  const provider = useProvider();

  return (
    <div className="header-wrapper">
      <div className="header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <p>🔥</p>
            <p>{provider ? <code>{provider.signerData.userAddress}</code> : 'Not connected'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
