import React from 'react';
import { useQuery } from '@apollo/client';
import { EVENTS_QUERY } from '../utils/subgraphQueries';
import EventCard from '../components/ui/EventCard';


function Events() {
    const { loading, error, data } = useQuery(EVENTS_QUERY);
  
    if (!loading) {
      
    }
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    return (
        <div>
            <h1>Events</h1>
            <ul>
                {
                    data.createEvents.map((event) =>
                        <EventCard
                            key={event.id}
                            name={event.name}
                            description={event.description}
                            storageBytes={event.eventStorage}
                            id={event.eventId}
                            creator={event.creator}
                        />
                    )
                }
            </ul>
      </div>
  );
}

export default Events;