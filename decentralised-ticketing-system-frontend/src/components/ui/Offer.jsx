import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";

function Offer({ offer, contract }) {
    const [event, setEvent] = useState(undefined);
    const [type, setType] = useState(undefined);
    useEffect(() => {
        console.log("here");
        contract.getEvent(offer.eventId).then((res) => {
            setEvent({
                creator: res[0],
                name: res[1],
                description: res[2],
                imageCid: res[3],
                startTime: res[4],
                endTime: res[5]
            });
        });
    }, [offer]);

    useEffect(() => {
        contract.getTicketType(offer.eventId, offer.ticketTypeId).then((ticketType) => {
            setType(ticketType);
        });
    }, [offer]);

    return (
        <div className="event-card">
            <Button>Accept offer</Button>
        </div>
    );
}

export default Offer;