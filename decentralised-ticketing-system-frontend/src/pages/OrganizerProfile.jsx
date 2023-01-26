import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { EVENTS_BY_CREATOR_QUERY } from '../utils/subgraphQueries';
import Loader from '../components/ui/Loader';
import EventCard from '../components/ui/EventCard';
import { Web3Context } from '../components/App';
function OrganizerProfile() {
    const [events, setEvents] = useState(undefined);
    const { address } = useParams();
    const { account, isActive } = useContext(Web3Context);
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(EVENTS_BY_CREATOR_QUERY, {
        variables: {
            creator: String(address)
        }
    });

    useEffect(() => {
        if  (isActive && account !== address) navigate("/");
        if (!loading) {
            setEvents(data.events);
        }
    }, [data, isActive, account, loading]);
    if(loading || events === undefined) return <Loader/>;   
    if (error) return <p>Error: {error.message}</p>;    
    return (
        <div className='d-flex justify-content-center flex-wrap mt-5'>
                {
                    events.map((event, index) => {
                        if (index % 4 === 0) {
                            return (
                            <div key={event.id} className='row w-75 d-flex justify-content-start'>
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
                                            url={`/events/${event.id}/dashboard`}
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
  );
}

export default OrganizerProfile;