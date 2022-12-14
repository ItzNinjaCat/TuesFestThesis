import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SelectWalletModal from '../ui/ConnectModal';
import Deposit from '../ui/Deposit';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import { GOERLI } from '../../constants/abis/chainIds';
import { connectorHooks, connectors, getName } from '../../utils/connectors';
import { CgProfile } from 'react-icons/cg';
import { getContract } from '../../utils/getContract';
import { parseEther , formatEther} from 'ethers/lib/utils';
import { TICKET_ADDRESS, TICKET_ABI } from '../../constants/contracts';
import { TIK_ADDRESS, TIK_ABI } from '../../constants/contracts';
import { SOUVENIR_ADDRESS, SOUVENIR_ABI } from '../../constants/contracts';

function useBalances(
  provider,
  accounts,
  account
){
  const [balances, setBalances] = useState();
  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false
      
      const contract = getContract(TIK_ADDRESS, TIK_ABI.abi, provider, account);
      void Promise.all(accounts.map((account) => contract.balanceOf(account))).then((balances) => {
        if (stale) return
        setBalances(balances.map((balance) => formatEther(balance)));
      });

      return () => {
        stale = true
        setBalances(undefined)
      }
    }
  }, [provider, accounts])
  return balances
}


function  Header() {
  const { connector } = useWeb3React();
  const [balance, setBalance] = React.useState(0);
  const hooks = connectorHooks[getName(connector)];
  const { useAccount, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks;
  const accounts = useAccounts();
  const isActivating = useIsActivating();
  const account = useAccount();
  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState(undefined);
  const balances = useBalances(provider, accounts, account);
  // console.log(balances);
  
  useEffect(() => {
    connector.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly')
    });
  }, [])

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
                <Nav.Link href="/organizers">Organizers</Nav.Link>
                <Nav.Link href="/marketplace">Marketplace</Nav.Link>
              </Nav>
              <Form className="d-flex">
                <Form.Control 
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                />
                {/* <Button variant="outline-success">Search</Button> */}
              </Form>
              {isActive ?
                <div className="d-flex align-items-center">
                <div className='d-flex flex-column align-items-end mx-2'>
                  <code>{account}</code>
                  <div>
                    <Deposit className='me-auto'/>
                    <code>Balance: {balances} Tik</code>
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
