
import React, { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image';

function Ticket({
    ticket,
    tokenURI,
}) {
    const [ticketImage, setTicketImage] = useState(undefined);
    useEffect(() => {
        fetch((tokenURI)).then(res => {
            res.json().then(metadata => {
                setTicketImage(metadata.image);
            });
        });
    }, [ticketImage, tokenURI]);

    return (
        <Image src={ticketImage} fluid rounded/>
    );
}

export default Ticket;