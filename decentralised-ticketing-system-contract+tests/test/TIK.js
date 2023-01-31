const { expect } = require("chai");
const { ethers } = require("hardhat");
async function generateSignature(tik, address, addr1, value) {
    const nonce = (await tik.nonces(address)); // Our Token Contract Nonces
    const deadline = + new Date() + 60 * 60; // Permit with deadline which the permit is valid
    const wrapValue = ethers.utils.parseEther(value); // Value to approve for the spender to use
      
    const EIP712Domain = [ // array of objects -> properties from the contract and the types of them ircwithPermit
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' }
    ];
    
    const domain = {
      name: await tik.name(),
      version: '1',
      verifyingContract: tik.address
    };
    
    const Permit = [ // array of objects -> properties from erc20withpermit
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ];
    
    const message = {
      owner: address,
      spender: addr1.address,
      value: wrapValue.toString(),
      nonce: nonce.toHexString(),
      deadline
    };
    
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })
    
    const signatureLike = await addr1.provider.send('eth_signTypedData_v4', [address, data]);
    const signature = await ethers.utils.splitSignature(signatureLike)
    
    return ({
      v: signature.v,
      r: signature.r,
      s: signature.s,
      deadline
    })
}
describe("TIK ERC20", function () {
    it("Should deploy TIK ERC20", async function () {
        const TIK = await ethers.getContractFactory("TIK");
        const tik = await TIK.deploy();
        await tik.deployed();
        expect(await tik.name()).to.equal("Ticket Token");
    });

    it("Should mint 1000 TIK to owner", async function () {
        const [owner] = await ethers.getSigners();
        const TIK = await ethers.getContractFactory("TIK");
        const tik = await TIK.deploy();
        await tik.deployed();
        await tik.mint(owner.address, 1000);
        expect(await tik.balanceOf(owner.address)).to.equal(1000);
    });

    it("Should transfer 100 TIK from owner to addr1", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const TIK = await ethers.getContractFactory("TIK");
        const tik = await TIK.deploy();
        await tik.deployed();
        await tik.mint(owner.address, 1000);
        await tik.transfer(addr1.address, 100);
        expect(await tik.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should burn 100 TIK from owner", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const TIK = await ethers.getContractFactory("TIK");
        const tik = await TIK.deploy();
        await tik.deployed();
        await tik.mint(owner.address, 1000);
        await tik.burn(owner.address, 100);
        expect(await tik.balanceOf(owner.address)).to.equal(900);
    });

    it("Should revert becauce of an invalid signature", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const TIK = await ethers.getContractFactory("TIK");
        const tik = await TIK.deploy();
        await tik.deployed();
        await tik.mint(owner.address, 1000);
        const signature = await generateSignature(tik, owner.address, addr1, "100");
        await expect(tik.permit(owner.address, addr1.address, ethers.utils.parseEther("100"), signature.deadline, 0, signature.r, signature.s)).to.be.revertedWith("ERC20WithPermit: INVALID_SIGNATURE");
    });
      it("Should revert becauce the permit is expired", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const TIK = await ethers.getContractFactory("TIK");
        const tik = await TIK.deploy();
        await tik.deployed();
        await tik.mint(owner.address, 1000);
        const signature = await generateSignature(tik, owner.address, addr1, "100");
        await expect(tik.permit(owner.address, addr1.address, ethers.utils.parseEther("100"), 0, signature.v, signature.r, signature.s)).to.be.revertedWith("ERC20WithPermit: EXPIRED");
    });
  });