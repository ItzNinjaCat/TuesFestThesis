
import { Modal } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image';

function Souvenir({
    souvenir
}) {
    const [souvenirMetadata, setSouvenirMetadata] = useState(undefined);
    const [show, setShow] = useState(false);

    useEffect(() => {
        fetch((souvenir.tokenURI)).then(res => {
            res.json().then(metadata => {
                setSouvenirMetadata(metadata);
            });
        });
    }, [souvenir.tokenURI]);
    return (
        <>
        <div role="button" onClick={() => setShow(true)}>
                <Image src={souvenirMetadata?.image} fluid rounded />
            <p className='desc-text d-flex justify-content-between'>
                <span>Event: {souvenir.ticket.event?.name}</span>
                <span>Id: {Number(souvenir?.id)}</span>
            </p>
            <p className='desc-text d-flex justify-content-between'>
                <span>Name: {souvenirMetadata?.name}</span>
            </p>
        </div>
        <Modal
            show={show}
            onHide={() => setShow(false)}
            centered
            keyboard={false}
        >
        <Modal.Header closeButton>
          <Modal.Title>Souvenir information</Modal.Title>
        </Modal.Header>
                <Modal.Body>
                    <div className='d-flex justify-content-center align-items-center'>
                        <div className='d-flex flex-column m-5'>
                                <p>Event name: {souvenir.ticket.event?.name}</p>
                                <p>Ticket name: {souvenir.ticket.ticketType?.name}</p>
                                <p>Souvenir name: {souvenirMetadata?.name}</p>
                                <p>Souvenir description: {souvenirMetadata?.description}</p>
                    </div>
                    </div>
                </Modal.Body>
        </Modal>    
        </>
    );
}

export default Souvenir;