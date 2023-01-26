import React from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { EVENTS_QUERY } from '../utils/subgraphQueries';
import EventCard from '../components/ui/EventCard';
import "../style/style.scss";
import Loader from '../components/ui/Loader';
function Events() {
    const [events, setEvents] = useState(undefined);
    const [first, setFirst] = useState(20);
    const [skip, setSkip] = useState(0);
    const { loading, error, data } = useQuery(EVENTS_QUERY, {
        variables: {
            skip: skip,
            first: first
        }
    });
    useEffect(() => {
        if (!loading && !error) {
            setEvents(data.events);
        }
    }, [loading, data]);
    if(loading || events === undefined) return <Loader/>;
    if (error) return <p>Error: {error.message}</p>;
    return (
        <div className='d-flex justify-content-center flex-wrap mt-5'>
                {
                    events?.map((event, index) => {
                        if (index % 4 === 0) {
                            return (
                            <div key={event?.id} className='row w-75 d-flex justify-content-start'>
                                    {
                                        events.slice(index, index + 4).map((event) => 
                                        <div key={event.id}
                                        className='w-25 col-3 d-flex flex-wrap text-wrap event-card'>
                                        <EventCard
                                            key={event.id}
                                            name={event.name}
                                            location={event.location}
                                            startTime={event.startTime}
                                            endTime={event.endTime}
                                            imagesCid={event.eventStorage}
                                            url={`/events/${event.id}`}
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

export default Events;