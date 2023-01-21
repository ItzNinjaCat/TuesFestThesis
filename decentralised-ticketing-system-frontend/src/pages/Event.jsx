import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import { getContract } from '../utils/contractUtils';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';
import TicketType from '../components/ui/TicketType';
import { ethers } from 'ethers';
import Loader from '../components/ui/Loader';
function Event() {
    const [event, setEvent] = useState(undefined);
    const [ticketTypes, setTicketTypes] = useState(undefined);
    const { connector } = useWeb3React();
    const hooks = connectorHooks[getName(connector)];
    const { useProvider, useAccount } = hooks;
    const provider = useProvider();
    const account = useAccount();
    const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);

    const { eventId } = useParams(); 
    useEffect(() => {
        contract.getEvent(eventId).then((event) => {
            console.log(event);
            return {
                eventId: eventId,
                organizer: event[0],
                name: event[1],
                description: event[2],
                eventStorage: event[3],
                startTime: event[4],
                endTime: event[5],
                ticketTypes: event[6],
            };
        }).then(async (event) => {
            setEvent(event);
            const ticketTypesPromises = await event.ticketTypes.map(async (ticketTypeId) => {
                return await contract.getTicketType(eventId, ticketTypeId).then((ticketType) => {
                    return ticketType;
                });
            })
            Promise.all(ticketTypesPromises).then((types) => {
                setTicketTypes(types);
            });
        });
    }, [provider, account, eventId, contract]);
    if (event === undefined || ticketTypes === undefined) return <Loader/>;
    return (
        <div>
            <div>
                <h2>{event.name}</h2>
                <p>{event.description}</p>
                <p>{event.eventStorage}</p>
                <p>{event.organizer}</p>
            </div>
            <div className='row w-75 d-flex justify-content-around'>
                {
                ticketTypes.map((ticketType) => 
                    <div key={ticketType.id} className='w-25 col-4 d-flex flex-wrap text-wrap'>
                        <TicketType
                            eventId={eventId}
                            ticketTypeId={ticketType.id}
                            name={ticketType.name}
                            price={ethers.utils.formatEther(ticketType.price)}
                            maxSupply={Number(ticketType.maxSupply)}
                            currentSupply={ticketType.currentSupply}
                            tokenURI={ticketType.tokenURI}
                            souvenirTokenURI={ticketType.souvenirTokenURI}
                        />
                        <p>{ticketType.id}</p>
                        <p>{ticketType.name}</p>
                        {/* <p>{ticketType.price}</p> */}
                        {/* <p>{ticketType.maxSupply}</p>
                        <p>{ticketType.currentSupply}</p> */}
                        <p>{ticketType.tokenURI}</p>
                        <p>{ticketType.souvenirTokenURI}</p>
                    </div>
                )
                }
            </div>
        </div>
    );
}
    
export default Event;