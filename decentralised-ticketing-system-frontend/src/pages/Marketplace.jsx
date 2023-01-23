import React from 'react';
import { useEffect } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton  from 'react-bootstrap/ToggleButton';
import CreateOfferModal from '../components/ui/CreateOfferModal';
import { useQuery } from '@apollo/client';
import { BUY_OFFERS_QUERY, SELL_OFFERS_QUERY } from '../utils/subgraphQueries';
import Offer from '../components/ui/Offer';
import Loader from '../components/ui/Loader';
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import { getContract } from '../utils/contractUtils';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';

function Marketplace() {
  const [offerType, setOfferType] = React.useState('buy');
  const [buyOffers, setBuyOffers] = React.useState([]);
  const [sellOffers, setSellOffers] = React.useState([]);

  const { connector } = useWeb3React();
  const hooks = connectorHooks[getName(connector)];
  const { useProvider, useAccount } = hooks;
  const provider = useProvider();
  const account = useAccount();
  const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);
  const { data : buyData, loading : buyLoading, error: buyError } = useQuery(BUY_OFFERS_QUERY);
  const { data : sellData, loading : sellLoading, error: sellError } = useQuery(SELL_OFFERS_QUERY);
  useEffect(() => {
    if (!buyLoading) {  
      const offerPromises = buyData.createBuyOffers.map(async (offer) => {
        return await contract.getOffer(offer.offerId).catch((err) => { console.log(offer) });
      });
      Promise.all(offerPromises).then((results) => {
        setBuyOffers(results);
      });
    }
  }, [buyData, buyLoading]);

  // useEffect(() => {
  //   if (!sellLoading) {
  //     const offerPromises = sellData.createSellOffers.map(async (offer) => {
  //       return await contract.getOffer(offer.offerId);
  //     });
  //     Promise.all(offerPromises).then((results) => {
  //       setSellOffers(results);
  //     });
  //   }
  // }, [sellData, sellLoading]);

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
        {(buyLoading || sellLoading) ? <Loader />
          : (
            <div className='d-flex justify-content-center mt-10'>
              <div className='row w-75 d-flex justify-content-around'>
                {offerType === 'buy' ? buyOffers?.map((offer) =>
                  <div key={offer.id} className='w-25 col-4 d-flex flex-wrap text-wrap event-card'>
                    <Offer key={offer.id} offer={offer}  contract={contract}/>
                  </div>
                ) : sellOffers?.map((offer) =>
                  <div key={offer.id} className='w-25 col-4 d-flex flex-wrap text-wrap event-card'>
                    <Offer key={offer.id} offer={offer} contract={contract}/>
                  </div>
                )}
              </div>
            </div>
        )
      }
      </div>
    </div>
  );
}

export default Marketplace;