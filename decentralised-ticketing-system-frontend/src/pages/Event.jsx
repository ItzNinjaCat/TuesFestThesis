import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TicketType from '../components/ui/TicketType';
import { ethers } from 'ethers';
import Loader from '../components/ui/Loader';
import { Web3Context } from '../components/App';
function Event() {
    const [event, setEvent] = useState(undefined);
    const [ticketTypes, setTicketTypes] = useState(undefined);
    const navigate = useNavigate();
    const { eventId } = useParams(); 
    const { provider, account, contract } = useContext(Web3Context);
    useEffect(() => {
        if(!provider || !account) return;
        contract.getEvent(eventId).then((event) => {
            return {
                eventId: eventId,
                organizer: event[0],
                name: event[1],
                description: event[2],
                eventStorage: event[3],
                startTime: event[4],
                endTime: event[5],
                ticketTypes: event[6],
            };
        }).then(async (event) => {
            setEvent(event);
            const ticketTypesPromises = await event.ticketTypes.map(async (ticketTypeId) => {
                return await contract.getTicketType(eventId, ticketTypeId).then((ticketType) => {
                    return ticketType;
                });
            })
            Promise.all(ticketTypesPromises).then((types) => {
                setTicketTypes(types);
            });
        }).catch((e) => {
            console.log(e.reason);
            navigate('/');
        });
    }, [provider, account, eventId]);
    if (event === undefined || ticketTypes === undefined) return <Loader/>;
    return (
        <div className='mt-5'>
        <div className='d-flex flex-column align-items-start'>
            <h2>{event.name}</h2>
            <h3>Event description:</h3>
            <p>{event.description}</p>
        </div>
        <div className='d-flex justify-content-center flex-wrap mt-5'>
            {
                ticketTypes.map((ticketType, index) => {
                    if (index % 4 === 0) {
                        return (
                            <div key={ticketType.id} className='row w-75 d-flex justify-content-center'>
                                {
                                    ticketTypes.slice(index, index + 4).map((type) => 
                                    <div key={type.id}
                                    className='w-25 col-3 d-flex flex-wrap text-wrap ticket-card'>
                                    <TicketType
                                        eventId={eventId}
                                        ticketTypeId={type.id}
                                        name={type.name}
                                        price={ethers.utils.formatEther(type.price)}
                                        eventName={event.name}
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