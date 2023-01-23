import React from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton  from 'react-bootstrap/ToggleButton';
import { BUY_TICKETS_EVENT_QUERY, SELL_TICKETS_QUERY, AVAILABLE_TICKETS_FOR_EVENT } from '../../utils/subgraphQueries';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { TICKET_ADDRESS, TICKET_ABI, TIK_ADDRESS, TIK_ABI } from '../../constants/contracts';
import { getContract } from '../../utils/contractUtils';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../../utils/connectors';
import { randomBytes } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { onAttemptToApprove } from "../../utils/contractUtils";
import { parseEther } from "ethers/lib/utils";

function CreateOfferModal() {
  const [show, setShow] = React.useState(false);
  const [offerType, setOfferType] = React.useState('buy');
  const [events, setEvents] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState("");
  const [selectedTicket, setSelectedTicket] = React.useState("");
  const [selectedTicketId, setSelectedTicketId] = React.useState("");
  const [tickets, setTickets] = React.useState([]);
  const [ticketObj, setTicketObj] = React.useState({});
  const [price, setPrice] = React.useState("");
  const [validated, setValidated] = React.useState(false);
  const { connector } = useWeb3React();
  const hooks = connectorHooks[getName(connector)];
  const { useProvider, useAccount } = hooks;
  const provider = useProvider();
  const account = useAccount();
const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);
const tokenContract = getContract(TIK_ADDRESS, TIK_ABI.abi, provider, account);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { loading : eventsBuyLoading, data: eventsBuyData } = useQuery(BUY_TICKETS_EVENT_QUERY, {
    variables: {
      timestamp: String(new Date().getTime())
    },
    skip: (offerType !== 'buy'),
    pollInterval: 500
  });
  const { loading : eventsSellLoading, data: eventsSellData } = useQuery(SELL_TICKETS_QUERY, {
    variables: {
      owner: account
    },
    skip: (offerType !== 'sell'),
    pollInterval: 500
  });
  const { loading: ticketsLoading, data: ticketsData } = useQuery(AVAILABLE_TICKETS_FOR_EVENT, {
    variables: {
      eventId: selectedEvent
    },
    pollInterval: 500
  });
  useEffect(() => {
    if (offerType === 'buy') {
        if (!eventsBuyLoading) {
            const eventsPromises = eventsBuyData.createEvents.map(async (event) => {
                return await contract.getEvent(event.eventId).then((result) => {
                    return {
                        id: event.id,
                        eventId: event.eventId,
                        organizer: result[0],
                        name: result[1],
                        description: result[2],
                        eventStorage: result[3],
                        startTime: result[4],
                        endTime: result[5],
                    };
                }).catch((err) => {
                    console.log(err);
                });
            })
            Promise.all(eventsPromises).then((events) => {
                setEvents(events.filter((event) => event !== undefined));
            });
      }
    }
  }, [eventsBuyLoading, offerType]);
  useEffect(() => {
    if(offerType === 'sell') {
      if (!eventsSellLoading) {
        const ticketPromises = eventsSellData.buyTickets.map((ticket) => {
            return contract.getTicket(ticket.tokenId).then((ticket) => {
                if (ticket.owner === account && ticket.usable === true)
                    return ticket;
            }).catch((err) => {
                console.log(err);
            });
        });
          Promise.all(ticketPromises).then((tickets) => {
        tickets = tickets.filter((ticket) => ticket !== undefined);
          setTicketObj(tickets);
          const promises = tickets.map((ticket) => {
            return {
              event: contract.getEvent(ticket.eventId).then((event) => {
                return {
                  eventId: ticket.eventId,
                  name: event[1],
                }
              }),
              ticketType: contract.getTicketType(ticket.eventId, ticket.ticketTypeId).then((ticketType) => {
                return {
                  ...ticketType,
                  eventId: ticket.eventId
                }
              })
            }
          });
          Promise.all(promises.map(async (item) => {
            const event = await item.event;
            const ticketType = await item.ticketType;
            return { event, ticketType };
          })).then((tickets) => {
            let events = [];
            tickets.forEach((ticket) => {
                events.push(ticket.event);
            });
            for(let i = 0; i < events.length; i++) {
              for(let j = i + 1; j < events.length; j++) {
                if(events[i].eventId === events[j].eventId) {
                  events.splice(j, 1);
                  j--;
                }
              }
            }
            setEvents(events);
            const ticketTypes = [];
            const countForIndex = [];
            tickets.forEach((ticket) => {
                ticketTypes.push(ticket.ticketType);
                countForIndex.push(1);
            });
            for (let i = 0; i < ticketTypes.length; i++) {
              for (let j = i + 1; j < ticketTypes.length; j++) {
                if (ticketTypes[i].id === ticketTypes[j].id) {
                  countForIndex[i]++;
                  ticketTypes.splice(j, 1);
                  countForIndex.splice(j, 1);
                  j--;
                }
              }
            }
            const ticketsWithCount = [];
            ticketTypes.forEach((ticketType, index) => {
              ticketsWithCount.push({ ticketType, count: countForIndex[index] });
            });
            setTickets(ticketsWithCount);
          });
        });
      }
    }
  }, [eventsSellLoading, offerType, account]);
  useEffect(() => {
    if (!ticketsLoading && offerType !== 'sell') {
      setTickets(ticketsData.createTicketTypes);
    }
  }, [ticketsLoading, selectedEvent]);

  const selectEvent = (eventId) => {
    setSelectedEvent(eventId);
    setSelectedTicket("");
    setSelectedTicketId("");
    setPrice("");
  }

  const selectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setPrice("");
    tickets.forEach((ticket) => {
      if (offerType === 'sell') {
        if (ticket.ticketType.id === ticketId) {
          setSelectedTicket({
            ...ticket.ticketType,
            maxSupply: ticket.count
          });
       }
      }
      else {
        if (ticket.ticketType_id === ticketId) {
          contract.getTicketType(ticket.eventId, ticket.ticketType_id).then((ticketType) => {
            setSelectedTicket(ticketType);
          });
        }
      }
    });
    
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
      console.log('submit');
      const offerId = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [randomBytes(32).toLocaleString()]));
        if (offerType === 'buy') {
            const event = events.find((event) => event.eventId === selectedEvent);
            const signature = await onAttemptToApprove(contract, tokenContract, account, price, +new Date(event.startTime * 1000) + 60 * 60);
        contract.createBuyOffer(
          offerId, selectedEvent, selectedTicketId, parseEther(price), signature.deadline, signature.v, signature.r, signature.s).then((res) => {
            console.log(res);
            handleClose();
          });
      }
      else {
        const ticket = ticketObj.find((ticket) => ticket.ticketTypeId === selectedTicketId);
        console.log(ticketObj)
        const tx = await contract.createSellOffer(offerId, selectedEvent, selectedTicketId, ticket.id, price)
        tx.wait().then(() => handleClose());
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
              variant="secondary"
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
              variant="secondary"
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
                >
                    <option value="" disabled hidden>Choose here</option>
                    {
                      events.map((event) => (
                        <option key={event.eventId} value={event.eventId}>{event.name}</option>
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
                >
                    <option value="" disabled hidden>Choose here</option>
                    {
                  tickets.map((ticket) => ( 
                        offerType === 'buy' && ticket?.ticketType_id ?
                      <option key={ticket.ticketType_id} value={ticket.ticketType_id}>{ticket.ticketType_name}</option> :
                      ticket.ticketType?.eventId === selectedEvent ?
                      <option key={ticket.ticketType.id} value={ticket.ticketType.id}>{ticket.ticketType.name}</option> : null
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