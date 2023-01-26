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
    location,
    imagesCid,
    url,
    startTime,
    endTime
}) {
    const navigate = useNavigate();
    const [imageUrls, setImageUrls] = React.useState([]);
    React.useEffect(() => {
        Promise.resolve(fetchImageUrls(imagesCid, setImageUrls));
    }, [imagesCid]);
    function openEventPage() {
        navigate(url);
    }
    if( imageUrls?.length === 0 ) return null;
    return (
        <>
            <div role="button" onClick={openEventPage}>
                {imageUrls.length > 0 ? <Image src={imageUrls[0]} className="mt-2" fluid rounded/> : null}
                <h4 className='text-break'>{name}</h4>
                <p className='text-break desc-text'>{location}</p>
                <p className='text-break desc-text'>
                    {
                        `
                        ${(new Date(startTime * 1000)).toLocaleDateString()} 
                        ${(new Date(startTime * 1000)).toLocaleTimeString().slice(0, -3)} 
                        ${`
                            ${
                            ((endTime * 1000 === 0) ? '' : 
                                ` - ${(new Date(endTime * 1000)).toLocaleDateString()}  
                                ${(new Date(endTime * 1000)).toLocaleTimeString().slice(0,-3)}
                            `)
                            }
                        `}
                            
                        `
                    }
                            </p>
            </div>
            </>
        )
}

export default EventCard;