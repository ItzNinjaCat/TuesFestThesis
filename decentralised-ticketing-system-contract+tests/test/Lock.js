const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("NFT generator", function(){
  let nftGen;
  let nft;

  beforeEach(async function() {
    nftGen = await ethers.getContractFactory("nftGenerator");
    nft = await nftGen.deploy();
  })

  describe("general testing", function () {
    it("Deployment should assign the total supply of tokens to the owner", async function () {
      let owner, addr1;
      [owner, addr1] = await ethers.getSigners();
      console.log("here")
      let test = await nft.mintNFT(owner.address, "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU");
      console.log( test.value);
    });
  });

})