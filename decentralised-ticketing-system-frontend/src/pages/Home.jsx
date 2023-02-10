import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { RECENT_EVENTS_QUERY } from '../utils/subgraphQueries';
import EventCard from '../components/ui/EventCard';
import '../style/style.scss';
import Loader from '../components/ui/Loader';

function Home() {
  const [events, setEvents] = useState(undefined);
  const { loading, error, data } = useQuery(RECENT_EVENTS_QUERY, {
    variables: {
      skip: 0,
      first: 20,
    },
  });

  useEffect(() => {
    if (!loading) {
      setEvents(data.events);
    }
  }, [loading, data]);

  if (loading || events === undefined) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      <div className="my-5">
        <h1>Recent events</h1>
      </div>

      <hr className="my-4" />

      {events.length > 0 ? (
        <div id="eventHolder" className="row">
          {events?.map((event, index) => (
            <div key={index} className="col-md-3">
              <div key={event.id} className="event-card">
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
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center my-5">No events</div>
      )}
    </div>
  );
}

export default Home;
