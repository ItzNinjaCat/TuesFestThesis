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
            process.env.REACT_APP_INFURA_KEY
                ? `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
            process.env.REACT_APP_ALCHEMY_KEY
                ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_KEY}`
                : '',
            'https://cloudflare-eth.com',
        ].filter(url => url !== ''),
        name: 'Mainnet',
    },
    3: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
        ].filter(url => url !== ''),
        name: 'Ropsten',
    },
    4: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
        ].filter(url => url !== ''),
        name: 'Rinkeby',
    },
    5: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
        ].filter(url => url !== ''),
        name: 'Görli',
    },
    42: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
        ].filter(url => url !== ''),
        name: 'Kovan',
    },
    // Optimism
    10: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://optimism-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
            'https://mainnet.optimism.io',
        ].filter(url => url !== ''),
        name: 'Optimism',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://optimistic.etherscan.io'],
    },
    69: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://optimism-kovan.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
            'https://kovan.optimism.io',
        ].filter(url => url !== ''),
        name: 'Optimism Kovan',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://kovan-optimistic.etherscan.io'],
    },
    // Arbitrum
    42161: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://arbitrum-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
            'https://arb1.arbitrum.io/rpc',
        ].filter(url => url !== ''),
        name: 'Arbitrum One',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://arbiscan.io'],
    },
    421611: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://arbitrum-rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
            'https://rinkeby.arbitrum.io/rpc',
        ].filter(url => url !== ''),
        name: 'Arbitrum Testnet',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://testnet.arbiscan.io'],
    },
    // Polygon
    137: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://polygon-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
            'https://polygon-rpc.com',
        ].filter(url => url !== ''),
        name: 'Polygon Mainnet',
        nativeCurrency: MATIC,
        blockExplorerUrls: ['https://polygonscan.com'],
    },
    80001: {
        urls: [
            process.env.REACT_APP_INFURA_KEY
                ? `https://polygon-mumbai.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
                : '',
        ].filter(url => url !== ''),
        name: 'Polygon Mumbai',
        nativeCurrency: MATIC,
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    },
    // Celo
    42220: {
        urls: ['https://forno.celo.org'],
        name: 'Celo',
        nativeCurrency: CELO,
        blockExplorerUrls: ['https://explorer.celo.org'],
    },
    44787: {
        urls: ['https://alfajores-forno.celo-testnet.org'],
        name: 'Celo Alfajores',
        nativeCurrency: CELO,
        blockExplorerUrls: ['https://alfajores-blockscout.celo-testnet.org'],
    },
};

export const URLS = Object.keys(CHAINS).reduce((accumulator, chainId) => {
    const validURLs = CHAINS[Number(chainId)].urls;

    if (validURLs.length) {
        accumulator[Number(chainId)] = validURLs;
    }

    return accumulator;
}, {});
