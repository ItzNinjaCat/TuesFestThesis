import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../components/App';
import Loader from '../components/ui/Loader';


function UseTicket() {
    const [error, setError] = useState(undefined);
    const [success, setSuccess] = useState(undefined);
    const { id } = useParams();
    const { account, provider, contract } = useContext(Web3Context);
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
