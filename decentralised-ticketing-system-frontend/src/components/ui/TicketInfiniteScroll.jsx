import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import InfiniteScroll from '@alexcambose/react-infinite-scroll';
import Ticket from './Ticket';
import Loader from './Loader';
function TicketInfiniteScroll({ query, contract, address }) {
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [tickets, setTickets] = useState([]);
  const { loading, data, fetchMore } = useQuery(query, {
    variables: {
      owner: String(address),
      first: 20,
      skip: 0,
    },
  });

  useEffect(() => {
    if (!loading) {
      if (data.tickets.length < 20) setHasMore(false);
      setInitialLoad(false);
      setTickets(data.tickets);
    }
  }, [address, loading]);

  const loadMore = () => {
    fetchMore({
      variables: {
        owner: String(address),
        first: 20,
        skip: tickets.length,
      },
    }).then(res => {
      if (res.data.tickets.length < 20) setHasMore(false);
      setTickets([...tickets, ...res.data.tickets]);
    });
  };
  if (loading && initialLoad) return <Loader />;
  return (
    <InfiniteScroll hasMore={hasMore} loadMore={loadMore} initialLoad={false} noMore={false}>
      <div className="row mt-10">
        {tickets.map((ticket, index) => (
          <div key={index} className="col-3 event-card">
            <Ticket
              key={ticket.id}
              ticket={ticket}
              contract={contract}
              event={ticket.event}
              ticketType={ticket.ticketType}
            />
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}

export default TicketInfiniteScroll;
