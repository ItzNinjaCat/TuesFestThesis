import { useState, useEffect, useContext }  from 'react';
import { useQuery } from '@apollo/client';
import { TICKETS_BY_OWNER_QUERY } from '../utils/subgraphQueries';
import Ticket from '../components/ui/Ticket';
import { useParams, useNavigate } from 'react-router-dom';
import "../style/style.scss";
import Loader from '../components/ui/Loader';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Web3Context } from '../components/App';
import Souvenir from '../components/ui/Souvenir';
function UserProfile() {
    const [tickets, setTickets] = useState([]);
    const [souvenirs, setSouvenirs] = useState([]);
    const [tab, setTab] = useState('tickets');
    const { account, contract, isActive } = useContext(Web3Context);
    const { address } = useParams();
    const { loading, error, data } = useQuery(TICKETS_BY_OWNER_QUERY, {
        variables: {
            owner: String(address)
        }
    });
    const navigate = useNavigate(); 
    useEffect(() => {
        if(isActive && account !== address) navigate("/");
        if (!loading) {
            setTickets(data.tickets);
            setSouvenirs(data.souvenirs);
        }
    }, [isActive, account, address, data, loading, tab]);
    if (loading) return <Loader />;
    if (error) return <p>Error: {error.message}</p>;
    return (
        <>
            <ButtonGroup className="d-flex">
                <ToggleButton
                type="radio"
                variant="secondary"
                    onClick={() => setTab('tickets')}
            checked={tab === 'tickets'}
            >Tickets</ToggleButton>
                <ToggleButton
                type="radio"
                variant="secondary"
                    onClick={() => {
                    setTab('souvenirs');
                }
                }
                checked={tab === 'souvenirs'}
                >Souvenirs</ToggleButton>
            </ButtonGroup>
            <div className='d-flex justify-content-center flex-wrap mt-10'>
                {
                    tab === 'tickets' ?
                    tickets.map((t, index) => {
                        if (index % 4 === 0) {
                        return (
                            <div key={index} className='row w-75 d-flex justify-content-start mb-3'>
                                 {

                                    tickets.slice(index, index + 4).map((ticket) => 
                                    <div key={ticket.id}
                                    className='w-25 col-3 d-flex flex-wrap text-wrap event-card'>
                                            <Ticket
                                                key={ticket.id}
                                                ticket={ticket}
                                                contract={contract}
                                                event={ticket.event}
                                                ticketType={ticket.ticketType}
                                            />
                                    </div>
                                    )    
                                }
                             </div>
                        )
                    }
                    return null;
                    })
                        : 
                    souvenirs.map((s, index) => {
                        if (index % 4 === 0) {
                        return (
                            <div key={index} className='row w-75 d-flex justify-content-start mb-3'>
                                 {

                                    souvenirs.slice(index, index + 4).map((souvenir) => 
                                    <div key={souvenir.id}
                                    className='w-25 col-3 d-flex flex-wrap text-wrap event-card'>
                                        <Souvenir key={souvenir.id} souvenir={souvenir}/>
                                    </div>
                                    )    
                                }
                             </div>
                        )
                    }
                    return null;
                    })
                }
                </div>
                </>
    );
}

export default UserProfile;