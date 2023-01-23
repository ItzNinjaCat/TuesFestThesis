import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import { getContract } from '../utils/contractUtils';
import Loader from '../components/ui/Loader';


function UseTicket() {
    const { connector } = useWeb3React();
    const hooks = connectorHooks[getName(connector)];
    const [error, setError] = useState(undefined);
    const [success, setSuccess] = useState(undefined);
    const { useProvider, useAccount } = hooks;
    const provider = useProvider();
    const account = useAccount();
    const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);
    const { id } = useParams();

    useEffect(() => {
        if (!provider || !account) return;
        contract.useTicket(id).then((tx) => {
            tx.wait().then((receipt) => {
                console.log(receipt);
                setSuccess(true);
            })
        }).catch((e) => {
            console.log(e.reason);
            setError(e.reason);
        });
    }, [provider, account, id]);
    if (!provider || !account) return <Loader />;
    if (error) return <p>Error: {error}</p>;
    if (success) return <p>Success!</p>;
}

export default UseTicket;
