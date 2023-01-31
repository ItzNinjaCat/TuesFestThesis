const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Souvenir NFT generator", function () {
    it("Should deploy Souvenir NFT generator", async function () {
        const SouvenirGenerator = await ethers.getContractFactory("SouvenirGenerator");
        const souvenirGenerator = await SouvenirGenerator.deploy();
        await souvenirGenerator.deployed();
        expect(await souvenirGenerator.name()).to.equal("Souvenir NFT");
    });
    it("Should revert because caller is not the ticket contract", async function () {
        const [owner] = await ethers.getSigners();
        const SouvenirGenerator = await ethers.getContractFactory("SouvenirGenerator");
        const souvenirGenerator = await SouvenirGenerator.deploy();
        await souvenirGenerator.deployed();
        await expect(souvenirGenerator.generateSouvenir(owner.address, "uri")).to.be.revertedWith("SouvenirGenerator: Only Ticket contract can call this function");
    });
    it("Should revert because caller is not the owner", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const SouvenirGenerator = await ethers.getContractFactory("SouvenirGenerator");
        const souvenirGenerator = await SouvenirGenerator.deploy();
        await souvenirGenerator.deployed();
        await expect(souvenirGenerator.connect(addr1).setTicketContractAddress(owner.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should revert because you can't transfer souvenirs", async function () {
        const [owner] = await ethers.getSigners();
        const SouvenirGenerator = await ethers.getContractFactory("SouvenirGenerator");
        const souvenirGenerator = await SouvenirGenerator.deploy();
        await souvenirGenerator.deployed();
        await expect(souvenirGenerator.transferFrom(owner.address, owner.address, 0)).to.be.revertedWith("You can't transfer souvenirs");
    });
});