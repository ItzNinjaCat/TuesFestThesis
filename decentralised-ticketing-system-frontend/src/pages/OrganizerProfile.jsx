import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { CURRENT_EVENTS_BY_ORGANIZER_QUERY } from '../utils/subgraphQueries';
import Loader from '../components/ui/Loader';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';
import { getContract } from '../utils/contractUtils';
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import EventCard from '../components/ui/EventCard';

function OrganizerProfile() {
    const deadline = +new Date() + 60 * 60;
    console.log(deadline)
    const timestamp = ((new Date().getTime()));
    const [ events, setEvents ] = useState(undefined);
    const { connector } = useWeb3React();
    const hooks = connectorHooks[getName(connector)];
    const { useProvider, useAccount } = hooks;
    const provider = useProvider();
    const account = useAccount();
    const { address } = useParams();
    const { loading, error, data } = useQuery(CURRENT_EVENTS_BY_ORGANIZER_QUERY, {
        variables: {
            creator: String(address),
            timestamp: String(timestamp)
        }
    });
    const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);

    useEffect(() => {
        if (!loading) {
            const eventsPromises = data.createEvents.map(async (event) => {
                return await contract.getEvent(event.eventId).then((result) => {
                    return {
                        id: event.id,
                        eventId: event.eventId,
                        organizer: result[0],
                        name: result[1],
                        description: result[2],
                        eventStorage: result[3]
                    };
                })
            })
            Promise.all(eventsPromises).then((events) => {
                setEvents(events);
            });
        }
    }, [data, provider, account, loading, contract]);
    if(loading || events === undefined) return <Loader/>;   
    if (error) return <p>Error: {error.message}</p>;    
    return (
        <div className='d-flex justify-content-center mt-10'>
            <div className='row w-75 d-flex justify-content-around'>
                {
                    events.map((event) =>
                        <div key={event.id}
                            className='w-25 col-4 d-flex flex-wrap text-wrap event-card'>
                            <EventCard
                                key={event.id}
                                name={event.name}
                                description={event.description}
                                imagesCid={event.eventStorage}
                                id={event.eventId}
                                creator={event.organizer}
                            />
                        </div>
                    )
                }
            </div>
        </div>
  );
}

export default OrganizerProfile;