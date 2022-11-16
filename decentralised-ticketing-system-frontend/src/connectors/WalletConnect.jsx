import { initializeConnector } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect';
import { URLS } from '../utils/chains';
const RPC = {
  1: ['https://cloudflare-eth.com'],
};

export const [walletConnect, hooks] = initializeConnector(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: RPC,
      },
    })
)

    