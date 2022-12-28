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
    console.log(data);
    return (
        <div>
            <h1>Events</h1>
            <div className='row'>
                {
                    data.createEvents.map((event) =>
                        <div key={event.id} className='w-25 col-4 d-flex flex-wrap text-wrap'>
                        <EventCard
                            key={event.id}
                            name={event.name}
                            description={event.description}
                            storageBytes={event.eventStorage}
                            id={event.eventId}
                            creator={event.creator}
                            />
                        </div>
                    )
                }
            </div>
      </div>
  );
}

export default Events;