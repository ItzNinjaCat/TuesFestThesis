import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton  from 'react-bootstrap/ToggleButton';

function Marketplace() {
  const [show, setShow] = React.useState(false);
  const [offerType, setOfferType] = React.useState('buy');
  const [events, setEvents] = React.useState([]);
  const [tickets, setTickets] = React.useState([]);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const getTicketsForUser = () => { }
  const getEvents = () => { }
  return (
    <div className="container my-5">
      <h1>Marketplace</h1>
      <p className="mt-3">
        Opinionated minimal boilerplate for starting React projects with Bootstrap and couple more
        goodies.
      </p>
      <div className="mt-5">
        <Button>Buy offers</Button>
        <Button>Sell offers</Button>  
      </div>
      <Button onClick={handleShow}>Create offer </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ButtonGroup className="d-flex">
            <ToggleButton
              type="radio"
              variant="secondary"
              onClick={() => setOfferType('buy')}
              checked={offerType === 'buy'}
            >Buy offer</ToggleButton>
            <ToggleButton
              type="radio"
              variant="secondary"
              onClick={() => setOfferType('sell')}
              checked={offerType === 'sell'}
            >Sell offer</ToggleButton>
          </ButtonGroup>
          <Form>
            {offerType === 'buy' ? 
              <Form.Label>Buy Offer</Form.Label>
              :
              <Form.Label>Sell offer</Form.Label>
            }
            <Form.Group controlId="price">
              <Form.Label>Event</Form.Label>
              <Form.Select>
                
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="price">
              <Form.Label>Ticket type</Form.Label>
              <Form.Select>
                
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="price">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" placeholder="Enter price" />
            </Form.Group>
            <Form.Group controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" placeholder="Enter quantity" />
            </Form.Group>
          </Form>
          </Modal.Body>
      </Modal>

    </div>
  );
}

export default Marketplace;