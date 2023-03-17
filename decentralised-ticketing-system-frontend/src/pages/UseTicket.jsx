import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3Context } from "../hooks/useWeb3Context";
import Loader from '../components/ui/Loader';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';

function UseTicket() {
    const [error, setError] = useState(undefined);
    const [success, setSuccess] = useState(undefined);
    const { ownerHash, id } = useParams();
    const navigate = useNavigate();
    const { account, provider, contract } = useWeb3Context();
    useEffect(() => {
        if (!provider || !account) return;
        contract.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')), account).then(
            (status) => {
              if(!status) navigate('/');
            });
        contract.ownerOf(id).then((owner) => {
            if (ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [owner.toLowerCase()])) !== ownerHash)  setError('Invalid owner hash');
        });
        contract.useTicket(id).then((tx) => {
            tx.wait().then((receipt) => {
                setSuccess(true);
            })
        }).catch((e) => {
            setError(e.reason);
        });
    }, [provider, account, id]);
    if (!provider || !account) return <Loader />;
    if (error) return (
        <div className='d-flex justify-content-center mt-10'>
            <div className='d-flex flex-column align-items-center'>
                <h3>Error: {error}</h3>
                <div>
                    <Button variant='primary' href='/'>Back to events</Button>
                </div>
            </div>
        </div>
    );
    if (success) return (
        <div className='d-flex justify-content-center mt-10'>
            <div className='d-flex flex-column align-items-center'>
                <h3>Successfully used ticket</h3>
                <div>
                    <Button variant='primary' href='/'>Back to events</Button>
                </div>
            </div>
        </div>
    );
}

export default UseTicket;
