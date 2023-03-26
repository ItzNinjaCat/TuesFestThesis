import React, { useEffect, useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Form, Button, InputGroup, Modal, ListGroup, DropdownButton } from 'react-bootstrap';
import { EVENTS_QUERY, EVENT_SEARCH } from '../utils/subgraphQueries';
import CATEGORIES from '../constants/categories.json';
import EventCard from '../components/ui/EventCard';
import '../style/style.scss';
import Loader from '../components/ui/Loader';
import InfiniteScroll from '@alexcambose/react-infinite-scroll';

function Events() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState(undefined);
  const [searchEvents, setSearchEvents] = useState(undefined);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [subcategoriesFilter, setSubcategoriesFilter] = useState([]);
  const [filterList, setFilterList] = useState({ categories: [], subcategories: [] });
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [show, setShow] = useState(false);
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

  const [
    getEvents,
    { loading: loadingEvents, error: errorEvents, data: dataEvents, fetchMore: fetchMoreEvents },
  ] = useLazyQuery(EVENT_SEARCH, {
    variables: {
      skip: 0,
      first: 20,
      search: searchQuery,
    },
  });

  const loadMoreResults = () => {
    fetchMoreEvents({
      variables: {
        skip: events.length,
        first: 20,
        search: searchQuery,
      },
    }).then(res => {
      if (res.data.events.length < 20) setHasMoreResults(false);
      setSearchEvents([...searchEvents, ...res.data.eventSearch]);
    });
  };
  const fetchEvents = () => {
    const searchArr = search.split(' ');
    let searchStr = searchArr.join(':* & ');
    searchStr = searchStr.concat(':*');
    setSearchQuery(searchStr);
    getEvents();
    setSearch('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetchEvents();
  };

  const handleCategoryChange = e => {
    if (e.target.checked) {
      setCategoriesFilter([...categoriesFilter, e.target.name]);
    } else {
      setCategoriesFilter(categoriesFilter.filter(category => category !== e.target.name));
    }
  };

  const handleSubcategoryChange = e => {
    if (e.target.checked) {
      setSubcategoriesFilter([...subcategoriesFilter, e.target.name]);
    } else {
      setSubcategoriesFilter(
        subcategoriesFilter.filter(subcategory => subcategory !== e.target.name),
      );
    }
  };

  const filter = e => {
    e.preventDefault();
    setFilterList({
      categories: categoriesFilter,
      subcategories: subcategoriesFilter,
    });
    setShow(false);
  };

  useEffect(() => {
    if (!loading && initialLoad) {
      if (data.events.length < 20) setHasMore(false);
      setInitialLoad(false);
      setEvents(data.events);
    }
  }, [loading, data]);
  console.log(filterList);
  useEffect(() => {
    if (!loadingEvents && searchQuery !== '') {
      if (dataEvents.eventSearch.length < 20) setHasMoreResults(false);
      setSearchEvents(dataEvents.eventSearch);
    }
  }, [loadingEvents, dataEvents]);
  if (loading || events === undefined) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-end">
        <div className="my-5">
          <h1>Current events</h1>
        </div>
        <div className="d-flex align-items-center">
          {filterList?.categories?.length === 0 &&
          filterList?.subcategories?.length === 0 ? null : (
            <Button
              onClick={() => {
                setFilterList({ categories: [], subcategories: [] });
                setCategoriesFilter([]);
                setSubcategoriesFilter([]);
              }}
              className="mx-3"
            >
              Clear filter
            </Button>
          )}
          <Button
            onClick={() => {
              setShow(true);
              setCategoriesFilter(filterList.categories);
              setSubcategoriesFilter(filterList.subcategories);
            }}
            className="mx-3"
          >
            Filter
          </Button>
          <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Filter events</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={filter}>
                <ListGroup>
                  {Object.entries(CATEGORIES.categories).map(([category, subcategories], index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex align-items-center justify-content-between"
                    >
                      <Form.Check
                        inline
                        label={category}
                        name={category}
                        type={'checkbox'}
                        id={category}
                        checked={categoriesFilter.includes(category)}
                        onChange={handleCategoryChange}
                      />
                      <ListGroup as={DropdownButton} title="Subcategories">
                        {subcategories.map(subcategory => (
                          <ListGroup.Item key={subcategory}>
                            <Form.Check
                              inline
                              label={subcategory}
                              name={subcategory}
                              type={'checkbox'}
                              id={subcategory}
                              checked={subcategoriesFilter.includes(subcategory)}
                              onChange={handleSubcategoryChange}
                            />
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button variant="primary" type="submit" className="float-end mt-4">
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          {searchEvents === undefined ? null : (
            <Button onClick={() => setSearchEvents(undefined)} className="mx-4">
              Clear search
            </Button>
          )}
          <Form className="d-flex my-5" onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Button variant="primary" onClick={fetchEvents} disabled={search.length < 3}>
                🔍
              </Button>
            </InputGroup>
          </Form>
        </div>
      </div>

      <hr className="my-4" />
      {searchEvents === undefined ? (
        <InfiniteScroll hasMore={hasMore} loadMore={loadMore} initialLoad={false} noMore={false}>
          {events.length > 0 ? (
            <div id="eventHolder" className="row">
              {filterList?.categories?.length === 0 && filterList?.subcategories?.length === 0
                ? events?.map((event, index) => (
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
                  ))
                : events
                    ?.filter(
                      event =>
                        filterList?.categories.includes(event.category) ||
                        filterList?.subcategories.includes(event.subcategory),
                    )
                    ?.map((event, index) => (
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
      ) : (
        <InfiniteScroll
          hasMore={hasMoreResults}
          loadMore={loadMoreResults}
          initialLoad={false}
          noMore={false}
        >
          {searchEvents?.length > 0 ? (
            <div id="eventHolder" className="row">
              {searchEvents?.map((event, index) => (
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
            <div className="text-center my-5">No results</div>
          )}
        </InfiniteScroll>
      )}
    </div>
  );
}

export default Events;
