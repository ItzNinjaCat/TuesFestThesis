const ETH = {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
};

const MATIC = {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
};

const CELO = {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
};

export const CHAINS = {
    1: {
    urls: [
      import.meta.env.infuraKey ? `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}` : '',
      import.meta.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_ALCHEMY_KEY}` : '',
      'https://cloudflare-eth.com',
    ].filter((url) => url !== ''),
    name: 'Mainnet',
    },
    5: {
    urls: [import.meta.env.infuraKey ? `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}` : ''].filter(
      (url) => url !== ''
    ),
    name: 'Görli',
    },
};

export const URLS = Object.keys(CHAINS).reduce((accumulator, chainId) => {
    const validURLs = CHAINS[Number(chainId)].urls;

    if (validURLs.length) {
        accumulator[Number(chainId)] = validURLs;
    }

    return accumulator;
}, {});
