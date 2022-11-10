// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);

  const NFTGenerator = await hre.ethers.getContractFactory("nftGenerator");
  const gasPrice = await NFTGenerator.signer.getGasPrice();
  console.log(`Current gas price: ${gasPrice}`);
  const estimatedGas = await NFTGenerator.signer.estimateGas(
   NFTGenerator.getDeployTransaction()
  );
  console.log(`Estimated gas: ${estimatedGas}`);
  const deploymentPrice = gasPrice.mul(estimatedGas);
  const deployerBalance = await NFTGenerator.signer.getBalance();
  console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
  console.log( `Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);
  if (Number(deployerBalance) < Number(deploymentPrice)) {
     throw new Error("You dont have enough balance to deploy.");
  }

  const nftGenetartor = await NFTGenerator.deploy();

  await nftGenetartor.deployed();

  console.log("Contract deployed to address:", nftGenetartor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
