import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TicketType from '../components/ui/TicketType';
import { ethers } from 'ethers';
import Loader from '../components/ui/Loader';
import { useQuery } from '@apollo/client';
import { EVENT_BY_ID_WITH_TICKETS_QUERY } from '../utils/subgraphQueries';
import { getData } from '../utils/web3.storageEndpoints';
import ImageGallery from 'react-image-gallery';
function Event() {
    const { eventId } = useParams(); 
    const [imageUrls, setImageUrls] = useState([]);
    const { loading, data } = useQuery(EVENT_BY_ID_WITH_TICKETS_QUERY, {
        variables: { id: String(eventId) },
    });
    
    useEffect(() => {
        if (!loading) {
            console.log(data);
            getData(data.event.eventStorage).then((res) =>{
                res.files().then((files) => {
                    setImageUrls(files.map((file) => {
                        return {
                            original: `${import.meta.env.VITE_W3LINK_URL}/${data.event.eventStorage}/${file.name}`
                    };
                    }));
                });
            });
        }
    }, [loading]);
    if (loading) return <Loader />;
    return (
        <div className='mt-5'>
            <div className='d-flex justify-content-center m-4'>
                    <h2>{data.event.name}</h2>
            </div>
            <div className='d-flex justify-content-center'>
            {imageUrls.length > 0 ?
                    <div className='w-50'>
                        <ImageGallery items={imageUrls}
                            showPlayButton={false}
                            showFullscreenButton={false}
                            showBullets={imageUrls.length > 1}
                            showNav={imageUrls.length > 1}
                            showThumbnails={false}
                            slideDuration={300}
                        />
                    </div>
                : null};
                </div>
            <div className='d-flex flex-column align-items-center'>
            <h3>Event Information</h3>
                <p>Event date: 
                    <span>
                    {
                        `
                        ${(new Date(data.event.startTime * 1000)).toLocaleDateString()} 
                        ${(new Date(data.event.startTime * 1000)).toLocaleTimeString().slice(0, -3)} 
                        ${`
                            ${
                        ((data.event.endTime * 1000 === 0) ? '' : 
                            (new Date(data.event.endTime * 1000).toLocaleDateString() !== new Date(data.event.startTime * 1000).toLocaleDateString()) ?
                                ` - ${(new Date(data.event.endTime * 1000)).toLocaleDateString()}  
                                ${(new Date(data.event.endTime * 1000)).toLocaleTimeString().slice(0, -3)}` : 
                                ` - ${(new Date(data.event.endTime * 1000)).toLocaleTimeString().slice(0, -3)}`
                        )
                            }
                        `}
                            
                        `
                    }
                </span></p>
            <p>Event location: {data.event.location}</p>
            <h3>Event description</h3>
            <p>{data.event.description}</p>
        </div>
        <div className='d-flex justify-content-center flex-wrap mt-5'>
            {
                data.event.ticketTypes.map((ticketType, index) => {
                    if (index % 4 === 0) {
                        return (
                            <div key={ticketType.id} className='row w-75 d-flex justify-content-center'>
                                {
                                    data.event.ticketTypes.slice(index, index + 4).map((type) => 
                                    <div key={type.id}
                                    className='w-25 col-3 d-flex flex-wrap text-wrap ticket-card'>
                                    <TicketType
                                        eventId={eventId}
                                        ticketTypeId={type.id}
                                        name={type.name}
                                        price={ethers.utils.formatEther(type.price)}
                                        eventName={data.event.name}
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