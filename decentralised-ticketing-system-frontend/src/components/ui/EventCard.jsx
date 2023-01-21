import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from 'react-bootstrap/Image'
import { getData } from '../../utils/web3.storageEndpoints';

async function fetchImageUrls(storageBytes, setImageUrls) {
    const tmp = await getData(storageBytes);
    const imageFiles = await tmp.files();
    const imageURLs = imageFiles.map((file) => {
        return `${process.env.REACT_APP_W3LINK_URL}/${storageBytes}/${file.name}`;
    });
    setImageUrls(imageURLs);
}

function EventCard({
    name,
    description,
    imagesCid,
    id,
    creator
}) {
    const navigate = useNavigate();
    const [imageUrls, setImageUrls] = React.useState([]);
    Promise.resolve(fetchImageUrls(imagesCid, setImageUrls));
    
    function openEventPage() {
        navigate(`/events/${id}`);
    }
    return (
        <>
            <div role="button" onClick={openEventPage}>
                {imageUrls.length > 0 ? <Image src={imageUrls[0]} className="mt-2" fluid rounded/> : null}
                <h3 className='text-break'>{name}</h3>
                <p className='text-break'>{description}</p>
                <p className='text-break'>{creator}</p>
            </div>
            </>
        )
}

export default EventCard;