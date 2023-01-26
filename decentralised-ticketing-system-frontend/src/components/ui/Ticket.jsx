
import { Modal, Button } from 'react-bootstrap';
import { formatEther } from 'ethers/lib/utils';
import { useEffect, useState, useContext } from 'react';
import Image from 'react-bootstrap/Image';
import QRCode from "react-qr-code";
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../App';

function Ticket({
    ticket,
    event,
    ticketType,
}) {
    const [ticketImage, setTicketImage] = useState(undefined);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const { contract } = useContext(Web3Context);
    function getSouvenir() {
        contract.getSouvenir(ticket.id).then((res) => {
            setShow(false);
            res.wait().then(() => {
                alert("Successfully minted souvenir!");
            });
            console.log(res)
        }).catch((e) => {
            alert(e.reason);
        });
    }

    useEffect(() => {
        fetch((ticket.tokenURI)).then(res => {
            res.json().then(metadata => {
                setTicketImage(metadata.image);
            });
        });
    }, [ticketImage, ticket.tokenURI]);
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
                                <Button onClick={() => navigate(`/events/${event?.id}`)}>Go to event's page</Button>
                                <Button onClick={getSouvenir}>
                                    Get souvenir
                                </Button>
                </Modal.Footer>
        </Modal>    
        </>
    );
}

export default Ticket;