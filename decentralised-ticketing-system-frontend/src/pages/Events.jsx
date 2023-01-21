import React from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { EVENTS_QUERY } from '../utils/subgraphQueries';
import EventCard from '../components/ui/EventCard';
import "../style/style.scss";
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import { getContract } from '../utils/contractUtils';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';
import Loader from '../components/ui/Loader';
function Events() {
    const [ events, setEvents ] = useState(undefined);
    const { connector } = useWeb3React();
    const hooks = connectorHooks[getName(connector)];
    const { useProvider, useAccount } = hooks;
    const provider = useProvider();
    const account = useAccount();
    const { loading, error, data } = useQuery(EVENTS_QUERY);
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
                        eventStorage: result[3],
                        startTime: result[4],
                        endTime: result[5],
                        ticketTypes: result[6],
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
        <div className='d-flex justify-content-center flex-wrap mt-10 h-100'>
                {
                    events.map((eventsa, index) => {
                        if (index % 4 === 0) {
                            return (
                            <div key={events[index].eventId} className='row w-75 d-flex justify-content-around'>
                                    {
                                        events.slice(index, index + 4).map((event) => 
                                        <div key={event.id}
                                        className='w-25 col-3 d-flex flex-wrap text-wrap event-card'>
                                        <EventCard
                                            key={event.id}
                                            name={event.name}
                                            description={event.description}
                                            startTime={event.startTime}
                                            endTime={event.endTime}
                                            imagesCid={event.eventStorage}
                                            url={`/events/${event.eventId}`}
                                                    creator={event.organizer}
                                                    style={{height: '200px'}}
                                        />
                                            </div>
                                        )
                                    }
                            </div>
                            )
                        }
                        return null;
                    } 
                    )
                }
        </div>
  );
}

export default Events;