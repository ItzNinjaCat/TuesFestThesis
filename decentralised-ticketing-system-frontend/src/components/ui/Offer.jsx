import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import { TICKET_QUERY } from "../../utils/subgraphQueries";
import { formatEther } from "ethers/lib/utils";
import { useQuery } from "@apollo/client";
import { onAttemptToApprove } from "../../utils/contractUtils";
function Offer({ offer, contract, account, tokenContract }) {
    const [event, setEvent] = useState(undefined);
    const [type, setType] = useState(undefined);
    const [tickets, setTickets] = useState([]);
    const { loading, error, data } = useQuery(TICKET_QUERY, {
        variables: {
            owner: account, 
            eventId: offer.eventId, 
            ticketTypeId: offer.ticketTypeId
        },
    });

    useEffect(() => {
        if (!loading) {
            const promises = data.buyTickets.map((ticket) => {
                return contract.getTicket(ticket.tokenId).then((res) => {
                    return res;
                });
            });
            Promise.all(promises).then((results) => {
                setTickets([...tickets, ...results.filter((t) => t.owner === account && t.usable === true)]);
            });
            const promisesBuy = data.acceptBuyOffers.map((ticket) => {
                return contract.getTicket(ticket.ticketId).then((res) => {
                    return res;
                });
            });
            Promise.all(promisesBuy).then((results) => {
                setTickets([...tickets, ...results.filter((t) => t.owner === account && t.usable === true)]);
            });
            const promisesSell = data.acceptSellOffers.map((ticket) => {
                return contract.getTicket(ticket.ticketId).then((res) => {
                    return res;
                });
            });
            Promise.all(promisesSell).then((results) => {
                setTickets([...tickets, ...results.filter((t) => t.owner === account && t.usable === true)]);
            });
        }
    }, [data, loading]);

    useEffect(() => {
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
            fetch((ticketType.tokenURI)).then(res => {
                res.json().then(metadata => {
                    setType({
                        ...ticketType,
                        image: metadata.image
                    });
                });
            });
        });
    }, [offer]);
    async function acceptOffer() {
        if(offer.sellOffer === true){
            const signature = await onAttemptToApprove(contract, tokenContract, account, formatEther(offer.price), +new Date() + 60 * 60);
            contract.acceptSellOffer(offer.id, signature.deadline, signature.v, signature.r, signature.s).then((res) => {
                console.log(res);
            }).catch((e) => {
                alert(e.reason);
            });
        }
        else if(offer.buyOffer === true){
            const ticketAvailable = tickets.find((t) => t.owner === account && t.usable === true);
            if(ticketAvailable === undefined){
                alert("You don't have any ticket available for this offer");
                return;
            }
            contract.acceptBuyOffer(offer.id, ticketAvailable.id).then((res) => {
                console.log(res);
            }).catch((e) => {
                alert(e.reason);
            });
        }

    }
    return (
        <div className="m-3">
            <Image src={type?.image} fluid rounded />
            <p className='desc-text d-flex justify-content-between'>
                <span>Event: {event?.name}</span>
                {offer.sellOffer ? <span>Id: {Number(offer?.ticketId)}</span> : null}
            </p>
            <p className='desc-text d-flex justify-content-between'>
                <span>Ticket: {type?.name}</span>
            </p>
            {(type !== undefined) ?
                <p className='desc-text'>Price: {formatEther(type.price)}</p>
            : null}
            <div className="d-flex justify-content-center">
                <Button onClick={acceptOffer}>Accept offer</Button>
            </div>
        </div>
    );
}

export default Offer;