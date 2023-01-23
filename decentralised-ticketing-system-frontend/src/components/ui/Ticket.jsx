
import { Modal, Button } from 'react-bootstrap';
import { formatEther } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image';
import QRCode from "react-qr-code";
import { useNavigate } from 'react-router-dom';

function Ticket({
    ticket,
    tokenURI,
    contract
}) {
    const [ticketImage, setTicketImage] = useState(undefined);
    const [ticketType, setTicketType] = useState(undefined);
    const [event, setEvent] = useState(undefined);
    const [show, setShow] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        fetch((tokenURI)).then(res => {
            res.json().then(metadata => {
                setTicketImage(metadata.image);
            });
        });
    }, [ticketImage, tokenURI]);

    useEffect(() => {
        contract.getTicketType(ticket.eventId, ticket.ticketTypeId).then((ticketType) => {
            setTicketType(ticketType);
        });
        contract.getEvent(ticket.eventId).then((res) => {
            setEvent({
                creator: res[0],
                name: res[1],
                description: res[2],
                imageCid: res[3],
                startTime: res[4],
                endTime: res[5],
            });
        });
    }, []);
    return (
        <>
        <div role="button" onClick={() => setShow(true)}>
            <Image src={ticketImage} fluid rounded />
            <p className='desc-text d-flex justify-content-between'>
                <span>Event: {event?.name}</span>
                <span>Id: {Number(ticket?.id)}</span>
            </p>
            <p className='desc-text d-flex justify-content-between'>
                <span>Name: {ticketType?.name}</span>
                <span>{event === undefined ? null : new Date(event?.startTime * 1000).toLocaleString().slice(0, -3)}</span>
            </p>
            {(ticketType !== undefined) ?
                <p className='desc-text d-flex justify-content-between'>
                    <span>Price: {formatEther(ticketType.price)}</span>
                    <span>Supply: {Number(ticketType.maxSupply)}</span>
                </p>
        : null}
            </div>
        <Modal
            show={show}
            onHide={() => setShow(false)}
            centered
            keyboard={false}
        >
        <Modal.Header closeButton>
          <Modal.Title>Ticket information</Modal.Title>
        </Modal.Header>
                <Modal.Body>
                    <div className='d-flex justify-content-center align-items-center'>
                        <div className='d-flex flex-column'>
                            <div className='mb-8'>
                                <p>Event name: {event?.name}</p>
                                {
                                    (ticketType !== undefined) ? 
                                    <>
                                    <p>Ticket name: {ticketType?.name}</p>
                                    <p>Price: {formatEther(ticketType?.price)}</p>
                                    </> : null
                                }
                                <p>Event start time: {new Date(event?.startTime * 1000).toLocaleString().slice(0, -3)}</p>
                                {
                                    event?.endTime * 1000 === 0 ? null :
                                        <p>Event end time: {new Date(event?.endTime * 1000).toLocaleString().slice(0, -3)}</p>
                                }
                            </div>
                    </div>
                        <QRCode value={`${window.location.origin}/use/${ticket?.id}`} />
                    </div>
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-between'>
                                <Button onClick={() => navigate(`/events/${ticket?.eventId}`)}>Go to event's page</Button>
                                <Button>
                                    Get souvenir
                                </Button>
                </Modal.Footer>
        </Modal>    
        </>
    );
}

export default Ticket;