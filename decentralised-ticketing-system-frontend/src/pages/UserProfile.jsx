import React, { useState, useEffect }  from 'react';
import { useQuery } from '@apollo/client';
import { TICKET_QUERY } from '../utils/subgraphQueries';
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import { getContract } from '../utils/contractUtils';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';
import Ticket from '../components/ui/Ticket';
import { useParams } from 'react-router-dom';
import "../style/style.scss";
import Loader from '../components/ui/Loader';

function UserProfile() {
    const [ tickets, setTickets ] = useState(undefined);
    const { connector } = useWeb3React();
    const hooks = connectorHooks[getName(connector)];
    const { useProvider, useAccount } = hooks;
    const provider = useProvider();
    const account = useAccount();
    const { address } = useParams();
    const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);
    const { loading, error, data } = useQuery(TICKET_QUERY, {
        variables: {
            owner: String(address)
        }
    });
    useEffect(() => {
        if (!loading) {
            Promise.all(data.buyTickets.map(async (ticket) => {
                return {
                    ticket: await contract.getTicket(ticket.tokenId),
                    tokenURI: ticket.tokenURI
                }
            })).then((results) => {
                   setTickets(results);
                })
        }
    }, [provider, account, contract, address, data, loading]);
    if (loading) return <Loader />;
    if (error) return <p>Error: {error.message}</p>;
    if (tickets === undefined) return <Loader/>;
    return (
        <div className='d-flex justify-content-center mt-10'>
            <div className='row w-75 d-flex justify-content-around'>
                {tickets.map((ticket) =>
                    <div key={ticket.ticket.id}
                        className='w-25 col-4 d-flex flex-wrap text-wrap event-card'>
                        <Ticket key={ticket.ticket.id} ticket={ticket.ticket} tokenURI={ticket.tokenURI} />
                    </div>
                )
                }
            </div>
        </div>
    );
}

export default UserProfile;