import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { EVENTS_BY_ORGANIZER_QUERY } from '../utils/subgraphQueries';
import Loader from '../components/ui/Loader';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';
import { getContract } from '../utils/contractUtils';
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import EventCard from '../components/ui/EventCard';
function OrganizerProfile() {
    const [events, setEvents] = useState(undefined);
    const { connector } = useWeb3React();
    const hooks = connectorHooks[getName(connector)];
    const { useProvider, useAccount } = hooks;
    const provider = useProvider();
    const account = useAccount();
    const { address } = useParams();
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(EVENTS_BY_ORGANIZER_QUERY, {
        variables: {
            creator: String(address)
        }
    });
    const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);

    useEffect(() => {
        if (account === undefined && provider === undefined) return;
        if(account !== address) navigate("/");
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
                    };
                }).catch(() => {});
            })
            Promise.all(eventsPromises).then((events) => {
                setEvents(events.filter((event) => event !== undefined));
            });
        }
    }, [data, provider, account, loading]);
    if(loading || events === undefined) return <Loader/>;   
    if (error) return <p>Error: {error.message}</p>;    
    return (
        <div className='d-flex justify-content-center flex-wrap mt-5'>
                {
                    events.map((event, index) => {
                        if (index % 4 === 0) {
                            return (
                            <div key={event.eventId} className='row w-75 d-flex justify-content-start'>
                                    {
                                        events.slice(index, index + 4).map((event) => 
                                        <div key={event.eventId}
                                        className='w-25 col-3 d-flex flex-wrap text-wrap event-card'>
                                        <EventCard
                                            key={event.eventId}
                                            name={event.name}
                                            description={event.description}
                                            startTime={event.startTime}
                                            endTime={event.endTime}
                                            imagesCid={event.eventStorage}
                                            url={`/events/${event.eventId}/dashboard`}
                                            creator={event.organizer}
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

export default OrganizerProfile;