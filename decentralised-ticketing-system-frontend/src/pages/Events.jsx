import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { EVENTS_QUERY } from '../utils/subgraphQueries';
import EventCard from '../components/ui/EventCard';
import '../style/style.scss';
import Loader from '../components/ui/Loader';
import InfiniteScroll from '@alexcambose/react-infinite-scroll';

function Events() {
  const [events, setEvents] = useState(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const { loading, error, data, fetchMore } = useQuery(EVENTS_QUERY, {
    variables: {
      skip: 0,
      first: 20,
    },
  });

  const loadMore = () => {
    fetchMore({
      variables: {
        skip: events.length,
        first: 20,
      },
    }).then(res => {
      if (res.data.events.length < 20) setHasMore(false);
      setEvents([...events, ...res.data.events]);
    });
  };

  useEffect(() => {
    if (!loading && initialLoad) {
      if (data.events.length < 20) setHasMore(false);
      setInitialLoad(false);
      setEvents(data.events);
    }
  }, [loading, data]);
  if (loading || events === undefined) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      <div className="my-5">
        <h1>Current events</h1>
      </div>

      <hr className="my-4" />

      <InfiniteScroll hasMore={hasMore} loadMore={loadMore} initialLoad={false} noMore={false}>
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
      </InfiniteScroll>
    </div>
  );
}

export default Events;
