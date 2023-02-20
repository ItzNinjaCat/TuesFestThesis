import React, { useState, useEffect } from 'react';
import { Button, Navbar, Nav, Offcanvas, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import SelectWalletModal from '../ui/ConnectModal';
import Deposit from '../ui/Deposit';
import Withdraw from '../ui/Withdraw';

import { useWeb3Context } from '../../hooks/useWeb3Context';

import md5 from 'md5';
import logo from '../../assets/logo.png';

function Header() {
  const navigate = useNavigate();
  const { connector, provider, account, isActive, balance, contract, setBalanceUpdate } = useWeb3Context();
  const [isOrganizer, setIsOrganizer] = useState(undefined);
  const [isOwner, setIsOwner] = useState(undefined);

  function truncate(str, n) {
    return str.length > n
      ? str.substr(0, n - 1) + '...' + str.substr(str.length - 4, str.length - 1)
      : str;
  }

  function becomeOrganizer() {
    contract
      .becomeOrganizer()
      .then(res => {
        res.wait().then(res => {
          alert('You are now an organizer');
          setIsOrganizer(true);
          setBalanceUpdate(true);
        });
      })
      .catch(e => {
        alert(e.reason);
      });
  }

  function ownerWithdraw() {
    contract.ownerWithdraw().catch(e => {
      if (e.reason !== undefined) {
        alert(e.reason);
      }
    });
  }

  useEffect(() => {
    if (provider && account && contract) {
      contract
        .hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')), account)
        .then(status => {
          setIsOrganizer(status);
        });
      contract
        .hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')), account)
        .then(status => {
          setIsOwner(status);
        });
    }
  }, [provider, account, contract]);

  useEffect(() => {
    connector.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly');
    });
  }, [connector]);

  return (
    <Navbar bg="light" expand="xl" sticky="top">
      <Container fluid>
        <img className="me-3 my-3" height={50} src={logo} alt="" />
        <Navbar.Brand href="/">Decentralized ticketing system</Navbar.Brand>
        <Navbar.Toggle aria-controls="navBar" />
        <Navbar.Offcanvas id="navBar" aria-labelledby="navBar" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="navBar">Decentralized ticketing system</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="align-items-center justify-content-between">
            <Nav className="d-flex align-items-center">
              <Link className="mx-2" to="events">
                Events
              </Link>
              <Link className="mx-2" to="marketplace">
                Marketplace
              </Link>
              {account !== undefined && isOrganizer !== undefined && isOwner !== undefined ? (
                isOrganizer ? (
                  <>
                    <Link className="mx-2" to="create-event">
                      Create event
                    </Link>
                    <Link className="mx-2" to={`/organizer/${account}`}>
                      Your events
                    </Link>
                  </>
                ) : null
              ) : null}
            </Nav>

            {isActive ? (
              <div className="d-flex align-items-center justify-content-end">
                <div className="d-flex">
                  <div className="me-2">
                    {!isOrganizer ? (
                      <Button onClick={becomeOrganizer}>Become an organizer</Button>
                    ) : null}
                    {isOwner ? (
                      <Button className="ms-3" onClick={ownerWithdraw}>
                        Withdraw fees
                      </Button>
                    ) : null}
                  </div>
                  <div className="me-2">
                    <Deposit />
                  </div>
                  <div className="me-1">
                    <Withdraw />
                  </div>
                </div>
                <span className="mx-3">|</span>
                <Link to={`/user/${account}`} className="text-secondary">
                  <img
                    className="img-profile me-3"
                    src={`https://www.gravatar.com/avatar/${md5(account)}/?d=identicon`}
                    alt=""
                  />
                </Link>
                <span>{truncate(account, 6)}</span>
                <span className="mx-3">|</span>
                <p>
                  <span className="fw-bold">Balance: </span>
                  <span>{balance} TIK</span>
                </p>
              </div>
            ) : (
              <SelectWalletModal />
            )}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;
