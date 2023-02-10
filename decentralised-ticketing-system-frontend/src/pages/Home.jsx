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
      console.log(data);
      setEvents(data.events);
    }
  }, [loading, data]);
  if (loading || events === undefined) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      <div className=" my-5">
        <h1>Recent events</h1>
      </div>
      <hr className="my-4" />
      <div id="eventHolder" className="d-flex justify-content-center flex-wrap m-5">
        {events?.map((event, index) => {
          if (index % 4 === 0) {
            return (
              <div key={event?.id} className="row w-75 d-flex justify-content-start">
                {events.slice(index, index + 4).map(event => (
                  <div key={event.id} className="w-25 col-3 d-flex flex-wrap text-wrap event-card">
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
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default Home;
