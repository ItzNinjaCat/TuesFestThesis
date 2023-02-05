
import { useState, useEffect } from 'react';
import { Button, Modal, Form, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { BUY_TICKETS_EVENT_QUERY, SELL_TICKETS_QUERY } from '../../utils/subgraphQueries';
import { useQuery } from '@apollo/client';
import { randomBytes } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { onAttemptToApprove } from "../../utils/contractUtils";
import { parseEther } from "ethers/lib/utils";
import { useWeb3Context } from "../../hooks/useWeb3Context";

function CreateOfferModal() {
    const [show, setShow] = useState(false);
    const [offerType, setOfferType] = useState('buy');
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [selectedTicket, setSelectedTicket] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState("");
    const [types, setTypes] = useState([]);
    const [tickets, setTickets] = useState({});
    const [price, setPrice] = useState("");
    const [validated, setValidated] = useState(false);
    const { account, contract, tokenContract } = useWeb3Context();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { loading : eventsBuyLoading, data: eventsBuyData } = useQuery(BUY_TICKETS_EVENT_QUERY, {
    variables: {
      timestamp: String(new Date().getTime())
    }
  });
  const { loading : eventsSellLoading, data: eventsSellData } = useQuery(SELL_TICKETS_QUERY, {
    variables: {
      owner: account
    }
  });
  useEffect(() => {
      if (!eventsBuyLoading && offerType === 'buy') {
        setEvents(eventsBuyData.events);
    }
  }, [eventsBuyLoading, offerType]);
  useEffect(() => {
      if (!eventsSellLoading && offerType === 'sell') { 
        const eventList = [];
        eventsSellData.tickets.forEach((ticket) => {
          if (!eventList.find((event) => event.id === ticket.event.id)){
            eventList.push(ticket.event);
          }
        });
          setEvents(eventList);
          setTickets(eventsSellData.tickets);
    }
  }, [eventsSellLoading, offerType]);

  const selectEvent = (eventId) => {
    setSelectedEvent(eventId);
    if(offerType === 'buy'){
      setTypes(events.find((event) => event.id === eventId).ticketTypes);
    }
    else{
      setTypes([...new Set(tickets.filter((ticket) => ticket.event.id === eventId).map((ticket) => ticket.ticketType))]);
    }
    setSelectedTicket("");
    setSelectedTicketId("");
    setPrice("");
  }

  const selectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setPrice("");
    setSelectedTicket(types.find((ticket) => ticket.id === ticketId).ticketType);
    
  }
  const validatePrice = (e) => {
      const value = Number(e.target.value);
      if (value < 0 && value > -100) {
          e.target.value = -Number(e.target.value);
      }
      else if (value < -100 || value > 100) {
          e.target.value = 100;
      }
      setPrice(e.target.value);
  }

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
    }
    else {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
      const offerId = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [randomBytes(32).toLocaleString()]));
        if (offerType === 'buy') {
            const event = events.find((event) => event.id === selectedEvent);
            const signature = await onAttemptToApprove(contract, tokenContract, account, price, +new Date(event.startTime * 1000) + 60 * 60);
        contract.createBuyOffer(
          offerId, selectedEvent, selectedTicketId, parseEther(price), signature.deadline, signature.v, signature.r, signature.s).then(() => {
            handleClose();
            handleClose();
            setSelectedEvent("");
            setSelectedTicket("");
            setSelectedTicketId("");
            setPrice("");
          });
      }
        else {
        const ticket = tickets.find((ticket) => ticket.ticketType.id === selectedTicketId);
        contract.createSellOffer(offerId, selectedEvent, selectedTicketId, ticket.tokenId, parseEther(price)).then(() => {
          handleClose();
          setSelectedEvent("");
          setSelectedTicket("");
          setSelectedTicketId("");
          setPrice("");
        });
      }
    }
  }
    return (
        <>
      <Button onClick={handleShow}>Create offer </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ButtonGroup className="d-flex">
            <ToggleButton
              type="radio"
              variant="light"
              onClick={() => {
                setSelectedEvent("");
                setSelectedTicket("");
                setSelectedTicketId("");
                setPrice("");
                setOfferType('buy');
              }
              }
              checked={offerType === 'buy'}
            >Buy offer</ToggleButton>
            <ToggleButton
                type="radio"
                variant="light"
                onClick={() => {
                    setSelectedEvent("");
                    setSelectedTicket("");
                    setSelectedTicketId("");
                    setPrice("");
                    setOfferType('sell');
                    }
                }
                checked={offerType === 'sell'}
            >Sell offer</ToggleButton>
          </ButtonGroup>
          <Form
            onSubmit={handleSubmit}
            noValidate
            validated={validated}
          >
            {offerType === 'buy' ? 
              <Form.Label>Buy Offer</Form.Label>
              :
              <Form.Label>Sell offer</Form.Label>
            }
            <Form.Group controlId="price">
              <Form.Label>Event</Form.Label>
              <Form.Select
                value={selectedEvent}
                onChange={(e) => selectEvent(e.target.value)}
                required
                disabled={events?.length === 0}
                >
                    <option value="" disabled hidden>Choose here</option>
                    {
                      events.map((event) => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))
                    }
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="price">
              <Form.Label>Ticket type</Form.Label>
              <Form.Select
                value={selectedTicketId}
                onChange={(e) => selectTicket(e.target.value)}
                required
                disabled={selectedEvent === ""}                
              >
                    <option value="" disabled hidden>Choose here</option>
                    {
                    types.map((ticket) => ( 
                      <option key={ticket.id} value={ticket.id}>{ticket.name}</option>
                      ))
                    }
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="price">
              <Form.Label>Price</Form.Label>
                <Form.Control 
                    type="number"
                    step="0.001"
                    placeholder="Ticket price"
                    onChange={validatePrice}
                    value={price}
                    required
                    min="0.001"
                max="100"
                disabled={selectedTicket === ""}
                />
                <Form.Control.Feedback type="invalid">
                    Minimum price is 0.001 Tik.
                </Form.Control.Feedback>
            </Form.Group>
          <div className="mt-4">
              <Button variant="primary" type="submit">
                  Submit
              </Button>
          </div>
          </Form>
          </Modal.Body>
      </Modal>
        </>
    );
}

export default CreateOfferModal;