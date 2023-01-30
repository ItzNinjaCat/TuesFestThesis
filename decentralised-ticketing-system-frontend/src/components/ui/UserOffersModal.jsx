import { useContext, useEffect, useState } from 'react';
import { Modal, Button, Tabs, Tab } from 'react-bootstrap';
import { Web3Context } from '../App';
import { USER_SELL_OFFERS_QUERY, USER_BUY_OFFERS_QUERY } from '../../utils/subgraphQueries';
import { useQuery } from '@apollo/client';
import InfiniteScroll from '@alexcambose/react-infinite-scroll';
import Offer from './Offer';
function UserOffersModal() {
    const [show, setShow] = useState(false);
    const { account } = useContext(Web3Context);
    const [buyOffers, setBuyOffers] = useState([]);
    const [sellOffers, setSellOffers] = useState([]);
    const [hasMoreBuyOffers, setHasMoreBuyOffers] = useState(true);
    const [hasMoreSellOffers, setHasMoreSellOffers] = useState(true);
    const [offerType, setOfferType] = useState('buy');
    const { data: dataSell, loading: loadingSell, fetchMore: fetchMoreBuy } = useQuery(USER_SELL_OFFERS_QUERY, {
        variables: {
            first: 20,
            skip: 0,
            account: account?.toLowerCase()
        }
    });
    const { data: dataBuy, loading: loadingBuy, fetchMore: fetchMoreSell } = useQuery(USER_BUY_OFFERS_QUERY, {
        variables: {
            first: 20,
            skip: 0,
            account: account?.toLowerCase()
        }
    });

  useEffect(() => {
    if (!loadingBuy) {
      setBuyOffers(dataBuy.offers);
    }
  }, [dataBuy, loadingBuy, offerType, account]);

  useEffect(() => {
    if (!loadingSell) {
      setSellOffers(dataSell.offers);
    }
  }, [dataSell, loadingSell, offerType, account]);


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
        <>
            <Modal
                show={show}
                onHide={() => setShow(false)}
                centered
                backdrop="static"
                keyboard={false}
                dialogClassName="offers-modal-w"
                contentClassName="offers-modal-w"
            >
                <Modal.Header closeButton>
                    <Modal.Title>My Offers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                    activeKey={offerType}
                    onSelect={(k) => setOfferType(k)}
                    fill
                    >
                      <Tab eventKey="buy" title="Buy Offers">
                        {
                          offerType === 'buy' ?
                          <InfiniteScroll
                            hasMore={hasMoreBuyOffers} loadMore={loadMoreBuyOffers} initialLoad={false} noMore={false}
                          >
                            <div className='d-flex justify-content-center flex-wrap mt-5'>
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
                            </div>
                          </InfiniteScroll> : null
                          }
                      </Tab>
                      <Tab eventKey="sell" title="Sell Offers">
                        {
                          offerType === 'sell' ?
                            <InfiniteScroll
                              hasMore={hasMoreSellOffers} loadMore={loadMoreSellOffers} initialLoad={false} noMore={false}
                            >
                              <div className='d-flex justify-content-center flex-wrap mt-5'>
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
                              </div>
                            </InfiniteScroll> : null
                        }
                      </Tab>
                  </Tabs> 
                </Modal.Body>
              </Modal>
              <Button variant="primary" onClick={() => setShow(true)}>Your Offers</Button>
        </>
    );
}

export default UserOffersModal;