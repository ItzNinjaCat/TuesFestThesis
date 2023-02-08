import React, { useEffect, useState } from "react";
import { Button, Image } from "react-bootstrap";
import { TICKETS_QUERY } from "../../utils/subgraphQueries";
import { formatEther } from "ethers/lib/utils";
import { useQuery } from "@apollo/client";
import { onAttemptToApprove } from "../../utils/utils";
import { useWeb3Context } from "../../hooks/useWeb3Context";
function Offer({ offer }) {
    const [image, setImage] = useState(undefined);
    const { account, contract, tokenContract, setBalanceUpdate } = useWeb3Context();
    const { loading, data } = useQuery(TICKETS_QUERY, {
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

    async function cancelOffer() {
        contract.cancelOffer(offer.id).then((res) => {
            console.log(res);
            res.wait().then((res) => {
                setBalanceUpdate(true);
            });
        }).catch((e) => {
            alert(e.reason);
        });
    }

    async function acceptOffer() {
        if(offer.sellOffer === true){
            const signature = await onAttemptToApprove(contract, tokenContract, account, formatEther(offer.price), +new Date() + 60 * 60);
            contract.acceptSellOffer(offer.id, signature.deadline, signature.v, signature.r, signature.s).then((res) => {
                console.log(res);
                res.wait().then((res) => {
                    setBalanceUpdate(true);
                });
            }).catch((e) => {
                alert(e.reason);
            });
        }
        else if(offer.buyOffer === true){
            const ticketAvailable = data.tickets.find((t) => t.owner === account.toLowerCase() && t.usable === true);
            if(ticketAvailable === undefined){
                alert("You don't have any ticket available for this offer");
                return;
            }
            contract.acceptBuyOffer(offer.id, ticketAvailable.id).then((res) => {
                console.log(res);
                res.wait().then((res) => {
                    setBalanceUpdate(true);
                });
            }).catch((e) => {
                alert(e.reason);
            });
        }

    }
    return (
        <div className="m-3">
            {offer.event.startTime < Math.floor(+new Date() / 1000) ?
                <div className="d-flex justify-content-center">
                    <p className="text-danger">Expired</p>
                </div> : null}
            <Image src={image} fluid rounded />
            <p className='desc-text d-flex justify-content-between'>
                <span>Event: {offer.event?.name}</span>
                {offer.sellOffer ? <span>Id: {Number(offer?.ticket?.tokenId)}</span> : null}
            </p>
            <p className='desc-text d-flex justify-content-between'>
                <span>Ticket: {offer.ticketType?.name}</span>
                <span>Price: {formatEther(offer.price)}</span>
            </p>
            {account === undefined ? null :
            <div className="d-flex justify-content-center">
                {
                    (offer.buyOffer && offer.buyer === account.toLowerCase() )||
                    (offer.sellOffer && offer.seller === account.toLowerCase()) ?
                        <Button onClick={cancelOffer} variant="danger">Cancel offer</Button>
                        : <Button onClick={acceptOffer}>Accept offer</Button>

                }
            </div>
            }
        </div>
    );
}

export default Offer;