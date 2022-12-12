import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import SelectWalletModal from '../ui/ConnectModal';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../utils/connectors';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import { CgProfile } from 'react-icons/cg';
import { getContract } from '../../utils/getContract';
import { parseEther , formatEther} from 'ethers/lib/utils';
import { TICKET_ADDRESS, TICKET_ABI } from '../../constants/contracts';
import { TIK_ADDRESS, TIK_ABI } from '../../constants/contracts';
import { SOUVENIR_ADDRESS, SOUVENIR_ABI } from '../../constants/contracts';

function Header() {
  const { active, account, activate, deactivate, library } = useWeb3React();
  const [balance, setBalance] = React.useState(0);
  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) {
      activate(connectors[provider]);
      // console.log(library);
      // const contract = getContract(TIK_ADDRESS, TIK_ABI.abi, library, account);
      // contract.balanceOf(account).then(bal =>
      //   setBalance(formatEther(bal))
      // );
      // console.log(balance);
      console.log(account);
    }
  }, [activate]);
  const disconnect = () => {
    window.localStorage.setItem("provider", undefined);
    deactivate();
  };

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
              {active ?
                <div className="d-flex align-items-center">
                <div className='d-flex flex-column align-items-end mx-2'>
                  <code>{account}</code>
                  <code>Balance:${balance} Tik</code>
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
