
import { Modal, Button } from 'react-bootstrap';
import { formatEther } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image';
import { useNavigate } from 'react-router-dom';

function Souvenir({
    souvenir
}) {
    const [souvenirImage, setSouvenirImage] = useState(undefined);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch((souvenir.tokenURI)).then(res => {
            res.json().then(metadata => {
                setSouvenirImage(metadata.image);
            });
        });
    }, [souvenirImage, souvenir.tokenURI]);
    return (
        <>
        <div role="button" onClick={() => setShow(true)}>
            <Image src={souvenirImage} fluid rounded />
        </div>
        <Modal
            show={show}
            onHide={() => setShow(false)}
            centered
            keyboard={false}
        >
        <Modal.Header closeButton>
          <Modal.Title>Ticket information</Modal.Title>
        </Modal.Header>
                <Modal.Body>
                    <div className='d-flex justify-content-center align-items-center'>
                        <div className='d-flex flex-column'>
                            <div className='mb-8'>
                            </div>
                    </div>
                    </div>
                </Modal.Body>
        </Modal>    
        </>
    );
}

export default Souvenir;