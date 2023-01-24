import React from 'react';
import { useEffect } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton  from 'react-bootstrap/ToggleButton';
import CreateOfferModal from '../components/ui/CreateOfferModal';
import { useQuery } from '@apollo/client';
import { OFFERS_QUERY } from '../utils/subgraphQueries';
import Offer from '../components/ui/Offer';
import Loader from '../components/ui/Loader';
import { TICKET_ADDRESS, TICKET_ABI, TIK_ADDRESS, TIK_ABI } from '../constants/contracts';
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
  const tokenContract = getContract(TIK_ADDRESS, TIK_ABI.abi, provider, account);
  const { data, loading, error } = useQuery(OFFERS_QUERY, {
    pollInterval: 1000
  });
  useEffect(() => {
    if (!loading) {  
      const buyOfferPromises = data.createBuyOffers.map(async (offer) => {
        return await contract.getOffer(offer.offerId).catch((e) => {});
      });
      Promise.all(buyOfferPromises).then((results) => {
        setBuyOffers(results.filter((offer) => offer !== undefined));
      });
      const sellOfferPromises = data.createSellOffers.map(async (offer) => {
        return await contract.getOffer(offer.offerId);
      });
      Promise.all(sellOfferPromises).then((results) => {
        setSellOffers(results.filter((offer) => offer !== undefined));
      });
    }
  }, [data, loading]);

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
                              <Offer key={offer.id} offer={offer} contract={contract} account={account} tokenContract={tokenContract}/>
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
                              <Offer key={offer.id} offer={offer} contract={contract} account={account} tokenContract={tokenContract}/>
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