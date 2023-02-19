import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { EVENTS_BY_CREATOR_QUERY } from '../utils/subgraphQueries';
import Loader from '../components/ui/Loader';
import EventCard from '../components/ui/EventCard';
import { useWeb3Context } from '../hooks/useWeb3Context';
import InfiniteScroll from '@alexcambose/react-infinite-scroll';

function OrganizerProfile() {
  const [events, setEvents] = useState(undefined);
  const { address } = useParams();
  const { account, isActive } = useWeb3Context();
  const [initialLoad, setInitialLoad] = useState(true);
  const [isAuthorised, setIsAuthorised] = useState(undefined);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { loading, error, data, fetchMore } = useQuery(EVENTS_BY_CREATOR_QUERY, {
    variables: {
      creator: String(address),
      first: 20,
      skip: 0,
    },
  });

  const loadMore = () => {
    fetchMore({
      variables: {
        creator: String(address),
        first: 20,
        skip: events.length,
      },
    }).then(res => {
      if (res.data.events.length < 20) setHasMore(false);
      setEvents([...events, ...res.data.events]);
    });
  };

  useEffect(() => {
    if (
      !isActive &&
      !loading &&
      (initialLoad || isAuthorised !== undefined) &&
      account === undefined
    )
      navigate('/');
    if (isActive && account !== address) {
      navigate(`/organizer/${account}`);
      setInitialLoad(true);
    }
    if (!loading) {
      if (error) navigate('/');
      else if (!data.organizers.length) navigate('/');
    }
    if (isActive && account === address) {
      setIsAuthorised(true);
    }
  }, [isActive, account, address, loading]);
  useEffect(() => {
    if (!loading && initialLoad) {
      if (data.events.length < 20) setHasMore(false);
      setInitialLoad(false);
      setEvents(data.events);
    }
  }, [data, isActive, account, loading]);
  if (loading || events === undefined) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="container">
      <div className="">
        <h1 className="my-5">Your events</h1>
      </div>
      <InfiniteScroll hasMore={hasMore} loadMore={loadMore} initialLoad={false} noMore={false}>
        <div className="row">
          {events.map((event, index) => (
            <div key={index} className="col-md-3">
              <div key={event.id} className="event-card">
                <EventCard
                  key={event.id}
                  name={event.name}
                  location={event.location}
                  startTime={event.startTime}
                  endTime={event.endTime}
                  imagesCid={event.eventStorage}
                  url={`/events/${event.id}/dashboard`}
                  creator={event.organizer}
                />
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default OrganizerProfile;
