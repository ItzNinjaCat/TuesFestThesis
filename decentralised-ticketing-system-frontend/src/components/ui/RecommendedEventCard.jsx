import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import { getData } from '../../utils/web3.storageEndpoints';
import { W3LINK_URL } from '../../constants/constants';
import { useQuery } from '@apollo/client';
import { GET_EVENT } from '../../utils/subgraphQueries';
function fetchImageUrls(storageBytes, setImageUrls) {
  getData(storageBytes).then(res => {
    res.files().then(files => {
      setImageUrls(
        files.map(file => {
          return `${W3LINK_URL}/${storageBytes}/${file.name}`;
        }),
      );
    });
  });
}

function RecommendedEventCard({ id }) {
  const navigate = useNavigate();
  const [event, setEvent] = React.useState(null);
  const [imageUrls, setImageUrls] = React.useState([]);
  const { loading, error, data } = useQuery(GET_EVENT, {
    variables: { id: id },
  });
  React.useEffect(() => {
    if (!loading) {
      setEvent(data.event);
      Promise.resolve(fetchImageUrls(data.event.eventStorage, setImageUrls));
    }
  }, [loading]);
  function openEventPage() {
    navigate(url);
  }
  if (imageUrls?.length === 0) return null;
  return (
    <>
      <div role="button" onClick={openEventPage}>
        {imageUrls.length > 0 ? <Image src={imageUrls[0]} className="mt-2" fluid rounded /> : null}
        <h4 className="text-break mt-4">{event.name}</h4>
        <p className="text-break desc-text mt-2">{event.location}</p>
        <p className="text-break desc-text mt-2">
          {`
                        ${new Date(Number(event.startTime)).toLocaleDateString()}
                        ${new Date(Number(event.startTime)).toLocaleTimeString().slice(0, -3)}
                        ${`
                            ${
                              Number(event.endTime) === 0
                                ? ''
                                : new Date(Number(event.endTime)).toLocaleDateString() ===
                                  new Date(Number(event.startTime)).toLocaleDateString()
                                ? ` - ${new Date(Number(event.endTime))
                                    .toLocaleTimeString()
                                    .slice(0, -3)}`
                                : new Date(Number(event.endTime)).getMilliseconds() !== 1
                                ? ` - ${new Date(Number(event.endTime)).toLocaleDateString()}
                                    ${new Date(Number(event.endTime))
                                      .toLocaleTimeString()
                                      .slice(0, -3)}`
                                : ` - ${new Date(Number(event.endTime)).toLocaleDateString()}`
                            }
                        `}

                        `}
        </p>
      </div>
    </>
  );
}

export default RecommendedEventCard;
