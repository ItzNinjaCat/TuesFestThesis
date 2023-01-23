import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import SelectWalletModal from '../ui/ConnectModal';
import Deposit from '../ui/Deposit';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Container from 'react-bootstrap/Container';
import { connectorHooks, getName } from '../../utils/connectors';
import { CgProfile } from 'react-icons/cg';
import { getContract } from '../../utils/contractUtils';
import { ethers } from 'ethers';
import { TICKET_ADDRESS, TICKET_ABI } from '../../constants/contracts';
import { TIK_ADDRESS, TIK_ABI } from '../../constants/contracts';
import { useNavigate } from 'react-router-dom';
import useBalances from '../../hooks/useBalance';
function Header() {
  const navigate = useNavigate();
  function createEvent() {
    navigate('/create-event');
  }



  function becomeOrganizer() {
    ticketContract.becomeOrganizer();
  }


  const { connector } = useWeb3React();
  const [balance, setBalance] = React.useState(undefined);
  const [isOrganizer, setIsOrganizer] = React.useState(undefined);
  const hooks = connectorHooks[getName(connector)];
  const { useAccount, useAccounts, useIsActive, useProvider } = hooks;
  const accounts = useAccounts();
  const account = useAccount();
  const isActive = useIsActive();

  const provider = useProvider();
  const tokenContract = getContract(TIK_ADDRESS, TIK_ABI.abi, provider, account);
  const ticketContract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);
  const balances = useBalances(provider, accounts, tokenContract);
  useEffect(() => {
    if (provider && account && ticketContract) {
      ticketContract.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')), account).then(
        (status) => {
          setIsOrganizer(status)
        })
    }
  }, [provider, account, ticketContract])
  useEffect(() => {
    if (provider && account && balances?.length) {
      setBalance(balances[0]);
    }
  }, [balances, account, provider])
  useEffect(() => {
    connector.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly')
    });
  }, [connector])

  function organizerProfile() {
    navigate(`/organizer/${account}`);
  }

  return (
    <Navbar bg="light" expand="xl" sticky="top">
      <Container fluid>
        <Navbar.Brand href="/">Decentralized ticketing system</Navbar.Brand>
        <Navbar.Toggle aria-controls="navBar" />
          <Navbar.Offcanvas
              id="navBar"
              aria-labelledby="navBar"
              placement="end"
            >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="navBar">
                Decentralized ticketing system
              </Offcanvas.Title>
            </Offcanvas.Header>
          <Offcanvas.Body
            className="align-items-center justify-content-between"
          >
              <Nav
                className="d-flex align-items-center"
              >
                <Nav.Link href="/events">Events</Nav.Link>
                <Nav.Link href="/marketplace">Marketplace</Nav.Link>
              </Nav>
            {
              account !== undefined && isOrganizer !== undefined ?
                
                (
                  isOrganizer ? 
                  <div>
                    <Button className="me-3" onClick={createEvent}>Create event</Button>
                    <Button onClick={organizerProfile}>Your events</Button>
                  </div>
                  : 
                  <Button onClick={becomeOrganizer}>Become an organizer</Button>
                  )
                : null
              }
              {isActive ?
                <div className="d-flex align-items-center">
                <div className="d-flex flex-column align-items-end mx-2">
                  <code>{account}</code>
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <Deposit tokenContract={tokenContract} provider={provider} accounts={accounts} account={account} setBalance={setBalance}/>
                    <code>Balance: {balance} Tik</code>
                  </div>
                </div>
                <Link to={`/user/${account}`} className='text-secondary'><CgProfile size="3em"/></Link>
                </div>
              : <SelectWalletModal/>
              }
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;
