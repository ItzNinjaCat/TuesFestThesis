import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { RECENT_EVENTS_QUERY, USER_PURCHASES } from '../utils/subgraphQueries';
import CATEGORIES from '../constants/categories.json';
import EventCard from '../components/ui/EventCard';
import RecommendedEventCard from '../components/ui/RecommendedEventCard';
import '../style/style.scss';
import Loader from '../components/ui/Loader';
import { useWeb3Context } from '../hooks/useWeb3Context';
function Home() {
  const [events, setEvents] = useState(undefined);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [recommendedEvents, setRecommendedEvents] = useState(undefined);
  const { openai, account } = useWeb3Context();
  const { loading, error, data } = useQuery(RECENT_EVENTS_QUERY, {
    variables: {
      skip: 0,
      first: 1000,
    },
  });
  const {
    loading: loadingPurchases,
    error: errorPurchases,
    data: dataPurchases,
  } = useQuery(USER_PURCHASES, {
    variables: {
      account: account?.toLowerCase() ? account?.toLowerCase() : '0x0',
      first: 1000,
      skip: 0,
    },
  });
  useEffect(() => {
    if (!loading && !loadingPurchases) {
      setEvents(data.events);
      console.log(loadingPurchases, errorPurchases);
      const eventJSON = JSON.stringify(
        data.events.map(event => {
          return {
            id: event.id,
            name: event.name,
            description: event.description,
            category: event.category,
            subcategory: event.subcategory,
          };
        }),
      );
      if (account != undefined) {
        const purchaseJSON = JSON.stringify(
          dataPurchases?.tickets.map(purchase => {
            return {
              name: purchase.event.name,
              description: purchase.event.description,
              category: purchase.event.category,
              subcategory: purchase.event.subcategory,
            };
          }),
        );
        console.log('requesting openai');
        const openaiMessage = `Purchases JSON: ${purchaseJSON} Event list JSON: ${eventJSON}`;
        console.log(openaiMessage);
        openai
          .createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are tasked with event recommendations. Your receive 2 lists of eventn in the form of JSON objects like this one: {"id": "Example id", "name" : "Example name", "description" : Example description", "category": "Example category", "sub-category": "Example sub-category"}. The first list is of all the events a user has visited. The second one is a list of the current events. Your job is to return a list of up to 40 events that you would recommend the user based on their previous attendance. Your response should be a list of the JSON objects. Each object should hae only one property that being the event\'s id. Here is the list of categories you have to use for this task:${JSON.stringify(
                  CATEGORIES,
                )}. Your recommendations should only be from categories the user has previously visited. If there are no matches for this condition return an empty array. You should NOT provide a code solution for this problem. Your only response should be a JSON object in the given format. The answer to this message should be and example response. Include only the json object in the response with NO additional data. If you decide none of the provided events should be recommended please return an empty array.The list should have UP to 40 entries meaning that if there are less than 40 you do not need to fill the list to 40. The response should have a format of { "recommendations" : [{id: "Id 1"}, {id: "Id 2" }] }. Do not include any text outside the json as this response will be used as program input. If the user has not visited any events return an empty array.`,
              },
              { role: 'user', content: `${openaiMessage}` },
            ],
          })
          .then(res => {
            console.log(res);
            setRecommendedEvents(JSON.parse(res.data.choices[0].message.content));
          });
      }
      console.log(data);
    }
  }, [loading, loadingPurchases, data, dataPurchases, account]);
  if (loading || events === undefined) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      {recommendedEvents?.recommendations?.length > 0 ? (
        <div>
          <div className="my-5">
            <h1>Recommended events</h1>
          </div>
          <hr className="my-4" />
          <div id="eventHolder" className="row">
            {recommendedEvents?.recommendations?.map((event, index) => (
              <div key={index} className="col-md-3">
                <div key={event.id} className="event-card">
                  <RecommendedEventCard key={event.id} id={event.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
