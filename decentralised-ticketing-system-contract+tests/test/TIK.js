const { expect } = require("chai");
const { ethers } = require("hardhat");
async function generateSignature(tikToken, address, addr1, value) {
    const nonce = (await tikToken.nonces(address)); // Our Token Contract Nonces
    const deadline = + new Date() + 60 * 60; // Permit with deadline which the permit is valid
    const wrapValue = ethers.utils.parseEther(value); // Value to approve for the spender to use
      
    const EIP712Domain = [ // array of objects -> properties from the contract and the types of them ircwithPermit
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' }
    ];
    
    const domain = {
      name: await tikToken.name(),
      version: '1',
      verifyingContract: tikToken.address
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
  let TikToken;
  let tikToken;

  before(async function () {
    TikToken = await ethers.getContractFactory("TIK");
    SouvenirGenerator = await ethers.getContractFactory("SouvenirGenerator");
    TicketGenerator = await ethers.getContractFactory("TicketGenerator");
  });
  beforeEach(async function () {
    tikToken = await TikToken.deploy();
    await tikToken.deployed();
    const [owner] = await ethers.getSigners();
    await tikToken.setTicketContractAddress(owner.address);
  });
  it("Should deploy TIK ERC20", async function () {
    expect(await tikToken.name()).to.equal("Ticket Token");
  });
  it("Should mint 1000 TIK to owner", async function () {
    const [owner] = await ethers.getSigners();
    await tikToken.mint(owner.address, 1000);
    expect(await tikToken.balanceOf(owner.address)).to.equal(1000);
  });
  it("Should revert mint because caller is not ticket generator", async function () {    
    const [owner, addr1] = await ethers.getSigners();
    await expect(tikToken.connect(addr1).mint(addr1.address, 1000)).to.be.revertedWith('TIK: Only Ticket contract can call this function');
  });
  it("Should transfer 100 TIK from owner to addr1", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await tikToken.mint(owner.address, 1000);
    await tikToken.transfer(addr1.address, 100);
    expect(await tikToken.balanceOf(addr1.address)).to.equal(100);
  });

  it("Should burn 100 TIK from owner", async function () {
    const [owner] = await ethers.getSigners();
    await tikToken.mint(owner.address, 1000);
    await tikToken.burn(owner.address, 100);
    expect(await tikToken.balanceOf(owner.address)).to.equal(900);
  });
  it("Should revert burning because caller is not ticket generator", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await tikToken.mint(addr1.address, 1000);
    await expect(tikToken.connect(addr1).burn(addr1.address, 1000)).to.be.revertedWith('TIK: Only Ticket contract can call this function');
  });
  it("Should revert permit because caller is not ticket generator", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const signature = await generateSignature(tikToken, owner.address, addr1, "100");
    await expect(tikToken.connect(addr1).permit(addr1.address, owner.address, ethers.utils.parseEther("100"), signature.deadline, signature.v, signature.r, signature.s)).to.be.revertedWith('TIK: Only Ticket contract can call this function');
  });
  it("Should revert becauce of an invalid signature", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await tikToken.mint(owner.address, 1000);
    const signature = await generateSignature(tikToken, owner.address, addr1, "100");
    await expect(tikToken.permit(owner.address, addr1.address, ethers.utils.parseEther("100"), signature.deadline, 0, signature.r, signature.s)).to.be.revertedWith("ERC20WithPermit: INVALID_SIGNATURE");
  });
  it("Should revert becauce the permit is expired", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await tikToken.mint(owner.address, 1000);
    const signature = await generateSignature(tikToken, owner.address, addr1, "100");
    await expect(tikToken.permit(owner.address, addr1.address, ethers.utils.parseEther("100"), 0, signature.v, signature.r, signature.s)).to.be.revertedWith("ERC20WithPermit: EXPIRED");
  });
  it("Should revert because caller is not owner", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await expect(tikToken.connect(addr1).setTicketContractAddress(addr1.address)).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
