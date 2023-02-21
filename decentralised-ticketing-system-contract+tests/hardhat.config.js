require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require('solidity-coverage');

const { ethers } = require("ethers");
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
  
    for (const account of accounts) {
      console.log(account.address);
    }
  });

module.exports = {
  mocha: {
    timeout: 100000000
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {},
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY_OWNER}`, `${process.env.PRIVATE_KEY_ADDR1}`],
    },
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  solidity: { 
    version: "0.8.9", 
    settings: { 
        optimizer: { 
        enabled: true, 
        runs: 200, 
        }, 
    }, 
  },
};
