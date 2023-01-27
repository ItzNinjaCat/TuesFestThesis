import React from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { EVENTS_QUERY } from '../utils/subgraphQueries';
import EventCard from '../components/ui/EventCard';
import "../style/style.scss";
import Loader from '../components/ui/Loader';
import InfiniteScroll from 'react-infinite-scroller';

function Events() {
    const [events, setEvents] = useState(undefined);
    const [first, setFirst] = useState(20);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const { loading, error, data, fetchMore } = useQuery(EVENTS_QUERY, {
        variables: {
            skip: 0,
            first: first
        }
    });

    const loadMore = () => {
        fetchMore({
            variables: {
                skip: events.length,
                first: first
            }
        }).then((res) => {

            if (res.data.events.length < first) setHasMore(false);
            setEvents([...events, ...res.data.events]);
        });
    };

    useEffect(() => {
        if (!loading && initialLoad) {
            if (data.events.length < first) setHasMore(false);
            setInitialLoad(false);
            setEvents(data.events);
        }
    }, [loading, data]);
    if(loading || events === undefined) return <Loader/>;
    if (error) return <p>Error: {error.message}</p>;
    return (
        
        <InfiniteScroll hasMore={hasMore} loadMore={loadMore} initialLoad={false} noMore={false}>
            <div id="eventHolder" className='d-flex justify-content-center flex-wrap m-5'>
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
        </InfiniteScroll>
  );
}

export default Events;