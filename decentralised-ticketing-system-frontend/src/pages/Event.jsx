import { useParams } from 'react-router-dom';
import TicketType from '../components/ui/TicketType';
import { ethers } from 'ethers';
import Loader from '../components/ui/Loader';
import { useQuery } from '@apollo/client';
import { EVENT_BY_ID_WITH_TICKETS_QUERY } from '../utils/subgraphQueries';
function Event() {
    const { eventId } = useParams(); 
    const { loading, data } = useQuery(EVENT_BY_ID_WITH_TICKETS_QUERY, {
        variables: { id: String(eventId) },
        });
    if (loading) return <Loader />;
    return (
        <div className='mt-5'>
        <div className='d-flex flex-column align-items-start'>
            <h2>{data.event.name}</h2>
            <h3>Event description:</h3>
            <p>{data.event.description}</p>
        </div>
        <div className='d-flex justify-content-center flex-wrap mt-5'>
            {
                data.event.ticketTypes.map((ticketType, index) => {
                    if (index % 4 === 0) {
                        return (
                            <div key={ticketType.id} className='row w-75 d-flex justify-content-center'>
                                {
                                    data.event.ticketTypes.slice(index, index + 4).map((type) => 
                                    <div key={type.id}
                                    className='w-25 col-3 d-flex flex-wrap text-wrap ticket-card'>
                                    <TicketType
                                        eventId={eventId}
                                        ticketTypeId={type.id}
                                        name={type.name}
                                        price={ethers.utils.formatEther(type.price)}
                                        eventName={data.event.name}
                                        currentSupply={type.currentSupply}
                                        tokenURI={type.tokenURI}
                                        souvenirTokenURI={type.souvenirTokenURI}
                                        />
                                    </div>
                                    )
                                }
                            </div>
                        );
                    }
                    return null;
                })
            }
        </div>
    </div>
    );
}
    
export default Event;