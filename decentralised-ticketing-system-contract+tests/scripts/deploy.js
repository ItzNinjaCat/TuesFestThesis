// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  const TikToken = await hre.ethers.getContractFactory("TIK"); 
  const tikToken = await TikToken.deploy(); 
  await tikToken.deployed(); 
  console.log("Tokens contract deployed to address: ", tikToken.address);

  const NFTGenerator = await hre.ethers.getContractFactory("nftGenerator");
  const nftGenetartor = await NFTGenerator.deploy(tikToken.address);

  await nftGenetartor.deployed();
  console.log("NFT Generator contract deployed to address: ", nftGenetartor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

