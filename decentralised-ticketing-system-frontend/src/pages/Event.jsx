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
        if(!provider || !account) return;
        contract.getEvent(eventId).then((event) => {
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
    }, [provider, account, eventId]);
    if (event === undefined || ticketTypes === undefined) return <Loader/>;
    return (
        <div>
            <div>
                <h2>{event.name}</h2>
                <p>{event.description}</p>
                <p>{event.eventStorage}</p>
                <p>{event.organizer}</p>
            </div>
            <div className='d-flex justify-content-center flex-wrap mt-5'>
                {
                    ticketTypes.map((ticketType, index) => {
                        if (index % 4 === 0) {
                            return (
                                <div key={ticketType.id} className='row w-75 d-flex justify-content-start'>
                                    {
                                        ticketTypes.slice(index, index + 4).map((type) => 
                                        <div key={type.id}
                                        className='w-25 col-3 d-flex flex-wrap text-wrap'>
                                        <TicketType
                                            eventId={eventId}
                                            ticketTypeId={type.id}
                                            name={type.name}
                                            price={ethers.utils.formatEther(type.price)}
                                            maxSupply={Number(type.maxSupply)}
                                            currentSupply={type.currentSupply}
                                            tokenURI={type.tokenURI}
                                            souvenirTokenURI={type.souvenirTokenURI}
                                        />
                                        <p>{type.id}</p>
                                        <p>{type.name}</p>
                                        <p>{type.tokenURI}</p>
                                        <p>{type.souvenirTokenURI}</p>
                                        </div>
                                        )
                                    }
                                </div>
                            );
                        }
                            return null;
                    })
                }
            </div>
        </div>
    );
}
    
export default Event;