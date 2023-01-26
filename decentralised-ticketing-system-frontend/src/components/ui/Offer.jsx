import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import { TICKETS_QUERY } from "../../utils/subgraphQueries";
import { formatEther } from "ethers/lib/utils";
import { useQuery } from "@apollo/client";
import { onAttemptToApprove } from "../../utils/contractUtils";
function Offer({ offer, contract, account, tokenContract }) {
    const [image, setImage] = useState(undefined);
    const { loading, error, data } = useQuery(TICKETS_QUERY, {
        variables: {
            owner: account,
            event: offer.event.id,
            ticketType: offer.ticketType.id,
        },
    });

    useEffect(() => {
        if (!loading) {
            fetch((offer.ticketType.tokenURI)).then(res => {
                res.json().then(metadata => {
                    setImage(metadata.image);
                });
            });
        }
    }, [data, loading]);

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
            const ticketAvailable = data.tickets.find((t) => t.owner === account && t.usable === true);
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
            <Image src={image} fluid rounded />
            <p className='desc-text d-flex justify-content-between'>
                <span>Event: {offer.event?.name}</span>
                {offer.sellOffer ? <span>Id: {Number(offer?.ticket?.tokenId)}</span> : null}
            </p>
            <p className='desc-text d-flex justify-content-between'>
                <span>Ticket: {offer.ticketType?.name}</span>
            </p>
            <p className='desc-text'>Price: {formatEther(offer.price)}</p>
            <div className="d-flex justify-content-center">
                <Button onClick={acceptOffer}>Accept offer</Button>
            </div>
        </div>
    );
}

export default Offer;