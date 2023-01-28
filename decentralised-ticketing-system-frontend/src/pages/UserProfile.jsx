import { useState, useEffect, useContext }  from 'react';
import { useQuery } from '@apollo/client';
import { TICKETS_BY_OWNER_QUERY, SOUVENIRS_BY_OWNER_QUERY } from '../utils/subgraphQueries';
import Ticket from '../components/ui/Ticket';
import { useParams, useNavigate } from 'react-router-dom';
import "../style/style.scss";
import Loader from '../components/ui/Loader';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Web3Context } from '../components/App';
import Souvenir from '../components/ui/Souvenir';
import InfiniteScroll from '@alexcambose/react-infinite-scroll';
function UserProfile() {
    const [tickets, setTickets] = useState([]);
    const [souvenirs, setSouvenirs] = useState([]);
    const [firstTicket, setFirstTicket] = useState(20);
    const [firstSouvenir, setFirstSouvenir] = useState(20);
    const [hasMoreTickets, setHasMoreTickets] = useState(true);
    const [hasMoreSouvenirs, setHasMoreSouvenirs] = useState(true);
    const [initialLoadTickets, setInitialLoadTickets] = useState(true);
    const [initialLoadSouvenirs, setInitialLoadSouvenirs] = useState(true);
    const [tab, setTab] = useState('tickets');
    const { account, contract, isActive } = useContext(Web3Context);
    const { address } = useParams();
    const {
        loading: loadingTickets,
        error: errorTickets,
        data: dataTickets,
        fetchMore: fetchMoreTicekts
    } = useQuery(TICKETS_BY_OWNER_QUERY, {
        variables: {
            owner: String(address),
            first: firstTicket,
            skip: 0,
        }
    });
    const {
        loading: loadingSouvenirs,
        error: errorSouvenirs, data: dataSouvenirs,
        fetchMore: fetchMoreSouvenirs
    } = useQuery(SOUVENIRS_BY_OWNER_QUERY, {
        variables: {
            owner: String(address),
            first: firstSouvenir,
            skip: 0,
        }
    });

    const navigate = useNavigate();

    useEffect(() => {
        if(isActive && account !== address) navigate("/");
        if(!isActive && !loadingTickets && initialLoadTickets && account === undefined) navigate("/");
        if(!isActive && !loadingSouvenirs && initialLoadSouvenirs && account === undefined) navigate("/");
    }, [isActive, account, address, loadingTickets, loadingSouvenirs]);

    useEffect(() => {
        if (!loadingTickets && initialLoadTickets) {
            if (dataTickets.tickets.length < firstTicket) setHasMoreTickets(false);
            setInitialLoadTickets(false);
            setTickets([...tickets, ...dataTickets.tickets]);
        }
    }, [address, loadingTickets, tab]);

    useEffect(() => {
        if(isActive && account !== address) navigate("/");
        if (!loadingSouvenirs && initialLoadSouvenirs) {
            if (dataSouvenirs.souvenirs.length < firstSouvenir) setHasMoreSouvenirs(false);
            setInitialLoadSouvenirs(false);
            setSouvenirs([...souvenirs, ...dataSouvenirs.souvenirs]);
        }
    }, [isActive, account, address, loadingSouvenirs, tab]);

    const loadMoreTickets = () => {
        fetchMoreTicekts({
            variables: {
                owner: String(address),
                first: firstTicket,
                skip: tickets.length,
            }
        }).then((res) => {
            if (res.data.tickets.length < firstTicket) setHasMoreTickets(false);
            setTickets([...tickets, ...res.data.tickets]);
        });
    };

    const loadMoreSouvenirs = () => {
        fetchMoreSouvenirs({
            variables: {
                owner: String(address),
                first: firstTicket,
                skip: tickets.length,
            }
        }).then((res) => {
            if (res.data.souvenirs.length < firstSouvenir) setHasMoreSouvenirs(false);
            setSouvenirs([...souvenirs, ...res.data.souvenirs]);
        });
    };

    if ((loadingTickets && initialLoadTickets) || (loadMoreSouvenirs  && initialLoadSouvenirs)) return <Loader />;
    if (errorTickets) return <p>Error: {errorTickets.message}</p>;
    if (errorSouvenirs) return <p>Error: {errorSouvenirs.message}</p>;
    return (
    <div className="container my-3">
      <div className='d-flex justify-content-center'>
        <h1>User profile</h1>
      </div>
      <div className="mt-5">
            <ButtonGroup className="d-flex">
                <ToggleButton
                type="radio"
                variant="light"
                    onClick={() => setTab('tickets')}
            checked={tab === 'tickets'}
            >Tickets</ToggleButton>
                <ToggleButton
                type="radio"
                variant="light"
                    onClick={() => {
                    setTab('souvenirs');
                }
                }
                checked={tab === 'souvenirs'}
                >Souvenirs</ToggleButton>
            </ButtonGroup>
                {
                tab === 'tickets' ?
                    <InfiniteScroll hasMore={hasMoreTickets} loadMore={loadMoreTickets} initialLoadTickets={false} noMore={false}>
                    <div className='d-flex justify-content-center flex-wrap mt-10'>
                        {
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
                        }
                        </div>
                        </InfiniteScroll>
                    : 
                    <InfiniteScroll hasMore={hasMoreSouvenirs} loadMore={loadMoreSouvenirs} initialLoadSouvenirs={false} noMore={false}>
                        <div className='d-flex justify-content-center flex-wrap mt-10'>
                            {
                                souvenirs.map((s, index) => {
                                    if (index % 4 === 0) {
                                        return (
                                            <div key={index} className='row w-75 d-flex justify-content-start mb-3'>
                                                {

                                                    souvenirs.slice(index, index + 4).map((souvenir) =>
                                                        <div key={souvenir.id}
                                                            className='w-25 col-3 d-flex flex-wrap text-wrap event-card'>
                                                            <Souvenir key={souvenir.id} souvenir={souvenir} />
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
                </InfiniteScroll>
                }
                </div>
            </div>
    );
}

export default UserProfile;