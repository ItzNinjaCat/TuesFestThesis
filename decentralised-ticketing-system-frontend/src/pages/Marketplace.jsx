import { useEffect, useState } from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import CreateOfferModal from '../components/ui/CreateOfferModal';
import { useQuery } from '@apollo/client';
import { BUY_OFFERS_QUERY, SELL_OFFERS_QUERY } from '../utils/subgraphQueries';
import Offer from '../components/ui/Offer';
import Loader from '../components/ui/Loader';
import InfiniteScroll from '@alexcambose/react-infinite-scroll';

function Marketplace() {
  const [offerType, setOfferType] = useState('buy');
  const [buyOffers, setBuyOffers] = useState([]);
  const [sellOffers, setSellOffers] = useState([]);
  const [hasMoreBuyOffers, setHasMoreBuyOffers] = useState(true);
  const [hasMoreSellOffers, setHasMoreSellOffers] = useState(true);
  const [initialLoadBuyOffers, setInitialLoadBuyOffers] = useState(true);
  const [initialLoadSellOffers, setInitialLoadSellOffers] = useState(true);
  const { data: dataBuy, loading: loadingBuy, fetchMore: fetchMoreBuy } = useQuery(BUY_OFFERS_QUERY, {
    variables: {
      skip: 0,
      first: 20,
    }
  });
  const { data: dataSell, loading: loadingSell, fetchMore: fetchMoreSell } = useQuery(SELL_OFFERS_QUERY, {
    variables: {
      skip: 0,
      first: 20,
    }
  });

  useEffect(() => {
    if (!loadingBuy && initialLoadBuyOffers) {
      setInitialLoadBuyOffers(false);
      setBuyOffers(dataBuy.offers);
    }
  }, [dataBuy, loadingBuy, offerType]);

  useEffect(() => {
    if (!loadingSell && initialLoadSellOffers) {
      setInitialLoadSellOffers(false);
      setSellOffers(dataSell.offers);
    }
  }, [dataSell, loadingSell, offerType]);


  const loadMoreBuyOffers = () => {
    fetchMoreBuy({
      variables: {
        skip: buyOffers.length,
      }
    }).then((res) => {
      setBuyOffers([...buyOffers, ...res.data.offers]);
      if (res.data.offers.length < 20) {
        setHasMoreBuyOffers(false);
      }
    });
  };

  const loadMoreSellOffers = () => {
    fetchMoreSell({
      variables: {
        skip: sellOffers.length,
      }
    }).then((res) => {
      setSellOffers([...sellOffers, ...res.data.offers]);
      if (res.data.offers.length < 20) {
        setHasMoreSellOffers(false);
      }
    });
  };

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
              variant="light"
              onClick={() => {
                setOfferType('buy');
              }
              }
              checked={offerType === 'buy'}
            >Buy offers</ToggleButton>
            <ToggleButton
              type="radio"
              variant="light"
              onClick={() => {
                setOfferType('sell');
              }
              }
              checked={offerType === 'sell'}
            >Sell offers</ToggleButton>
        </ButtonGroup>
        {((loadingBuy && initialLoadBuyOffers) || (loadingSell && initialLoadSellOffers)) ? <Loader />
          : (
            <div>
              {
                offerType === 'buy' ? 
                  <div className='d-flex justify-content-center flex-wrap mt-5'>
                    <InfiniteScroll
                    hasMore={hasMoreBuyOffers} loadMore={loadMoreBuyOffers} initialLoad={false} noMore={false}
                    >
                  {
                    buyOffers?.map((off, index) => {
                      if (index % 4 === 0) {
                        return (
                          <div key={index} className='row w-75 d-flex justify-content-start'>
                            {
                              buyOffers.slice(index, index + 4).map((offer) =>
                                <div key={offer.id} className='w-25 col-3 d-flex flex-wrap text-wrap ticket-card'>
                                  <Offer key={offer.id} offer={offer} />
                                </div>
                              )
                            }
                          </div>
                        )
                      }
                      return null;
                    })
                      } 
                    </InfiniteScroll>
                  </div>
                  : 
                  <div className='d-flex justify-content-center flex-wrap mt-5'>
                    <InfiniteScroll
                    hasMore={hasMoreSellOffers} loadMore={loadMoreSellOffers} initialLoad={false} noMore={false}
                    >
                    {
                      sellOffers?.map((off, index) => {
                        if (index % 4 === 0) {
                          return (
                            <div key={index} className='row w-75 d-flex justify-content-start'>
                              {
                                sellOffers.slice(index, index + 4).map((offer) =>
                                  <div key={offer.id} className='w-25 col-3 d-flex flex-wrap text-wrap ticket-card'>
                                    <Offer key={offer.id} offer={offer} />
                                  </div>
                                )
                              }
                            </div>
                          )
                        }
                        return null;
                      })
                      }
                      </InfiniteScroll>
                  </div>
              }
              </div>
        )
      }
      </div>
    </div>
  );
}

export default Marketplace;