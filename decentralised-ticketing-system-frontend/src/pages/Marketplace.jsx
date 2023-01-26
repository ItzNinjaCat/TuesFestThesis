import { useEffect, useState } from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import CreateOfferModal from '../components/ui/CreateOfferModal';
import { useQuery } from '@apollo/client';
import { OFFERS_QUERY } from '../utils/subgraphQueries';
import Offer from '../components/ui/Offer';
import Loader from '../components/ui/Loader';

function Marketplace() {
  const [offerType, setOfferType] = useState('buy');
  const [buyOffers, setBuyOffers] = useState([]);
  const [sellOffers, setSellOffers] = useState([]);
  const { data, loading } = useQuery(OFFERS_QUERY);
  useEffect(() => {
    if (!loading) {  
      setBuyOffers(data.offers.filter(offer => offer.buyOffer === true));
      setSellOffers(data.offers.filter(offer => offer.sellOffer === true));
    }
  }, [data, loading, offerType]);

  return (
    <div className="container my-5">
      <div className='d-flex justify-content-between'>
        <h1>Marketplace</h1>
        <CreateOfferModal/>
      </div>
      <div className="mt-5">
          <ButtonGroup className="d-flex">
            <ToggleButton
              type="radio"
              variant="secondary"
              onClick={() => {
                setOfferType('buy');
              }
              }
              checked={offerType === 'buy'}
            >Buy offers</ToggleButton>
            <ToggleButton
              type="radio"
              variant="secondary"
              onClick={() => {
                setOfferType('sell');
              }
              }
              checked={offerType === 'sell'}
            >Sell offers</ToggleButton>
        </ButtonGroup>
        {(loading) ? <Loader />
          : (
            <div className='d-flex justify-content-center flex-wrap mt-5'>
                {
                offerType === 'buy' ? (
                  buyOffers?.map((off, index) => {
                  if (index % 4 === 0) {
                    return (
                      <div key={index} className='row w-75 d-flex justify-content-start'>
                        {
                          buyOffers.slice(index, index + 4).map((offer) => 
                            <div key={offer.id} className='w-25 col-3 d-flex flex-wrap text-wrap ticket-card'>
                              <Offer key={offer.id} offer={offer}/>
                            </div>
                          )
                        }
                      </div>
                    )
                  }
                  return null;
                })
                ) : 
                  sellOffers?.map((off, index) => {
                  if (index % 4 === 0) {
                    return (
                      <div key={index} className='row w-75 d-flex justify-content-start'>
                        {
                          sellOffers.slice(index, index + 4).map((offer) => 
                            <div key={offer.id} className='w-25 col-3 d-flex flex-wrap text-wrap ticket-card'>
                              <Offer key={offer.id} offer={offer}/>
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
        )
      }
      </div>
    </div>
  );
}

export default Marketplace;