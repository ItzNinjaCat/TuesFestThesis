const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("NFT generator", function () {
  let TicketGenerator;
  let ticketGenerator;
  let SouvenirGenerator;
  let souvenirGenerator;
  let TikToken;
  let tikToken;
  let owner;
  let addr1;
  let preparedSignatureOwner;
  let preparedSignatureAddr1;

  async function generateSignature(address, value) {
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
      spender: ticketGenerator.address,
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
    
    const signatureLike = await ticketGenerator.provider.send('eth_signTypedData_v4', [address, data]);
    const signature = await ethers.utils.splitSignature(signatureLike)
    
    return ({
      v: signature.v,
      r: signature.r,
      s: signature.s,
      deadline
    })
  }
  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    TikToken = await ethers.getContractFactory("TIK");
    SouvenirGenerator = await ethers.getContractFactory("SouvenirGenerator");
    TicketGenerator = await ethers.getContractFactory("TicketGenerator");
  });
  
  beforeEach(async function () {
    tikToken = await TikToken.deploy();
    await tikToken.deployed();
    souvenirGenerator = await SouvenirGenerator.deploy();
    await souvenirGenerator.deployed();
    ticketGenerator = await TicketGenerator.deploy(tikToken.address, souvenirGenerator.address);
    await ticketGenerator.deployed();
    await souvenirGenerator.setTicketContractAddress(ticketGenerator.address);
  })

  
  describe("TIK tests", function () {
    it("Deployment should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await tikToken.balanceOf(owner.address);
      expect(await tikToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("TicketGenerator tests", function () {
  
    describe("Acess Control", function () {

      it("Should set the right owner", async function () {
        expect(await ticketGenerator.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')), owner.address)).to.equal(true);
      });

      it("Should grant the right role", async function () {
        await ticketGenerator.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        expect(await ticketGenerator.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address)).to.equal(true);
      });
    });
    describe("Events", function () {
      it("Should create an event", async function () {
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        await ticketGenerator.connect(addr1).createEvent(eventId);
        expect(await ticketGenerator.getEvent(eventId)).equal(eventId);
      });
      it("Should revert because user is not an organizer and cannot an event", async function () {
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        await expect(ticketGenerator.connect(addr1).createEvent(eventId)).to.be.revertedWith("Only event organizers can call this function");
      });
      it("Should revert because event already exists", async function () {
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        await ticketGenerator.connect(addr1).createEvent(eventId);
        await expect(ticketGenerator.connect(addr1).createEvent(eventId)).to.be.revertedWith("Event already exists");
      });
      it("Should delete an event", async function () {
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        await ticketGenerator.connect(addr1).createEvent(eventId);
        expect(await ticketGenerator.getEvent(eventId)).equal(eventId);
        await ticketGenerator.connect(addr1).deleteEvent(eventId);
        await expect(ticketGenerator.getEvent(eventId)).to.be.revertedWith("Event does not exist");
      });
    });
    describe("Ticket Types", function () {
      it("Should create a ticket type", async function () {
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        await ticketGenerator.connect(addr1).createEvent(eventId);
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          1,
          100,
        );
        expect((await ticketGenerator.getTicketType(eventId, ticketTypeId)).id).to.equal(ticketTypeId);
      });
      it("Should revert because event does not exist", async function () {
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await expect(ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          1,
          100,
        )).to.be.revertedWith("Event does not exist");
      });
      it("Should revert because user is not an organizer for this and cannot create a ticket type", async function () {

        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(owner).createEvent(eventId);
        await expect(ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          1,
          100,
        )).to.be.revertedWith("Only event organizers can call this function");
      });
      it("Should revert because user is not an organizer and cannot create a ticket type", async function () {
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(owner).createEvent(eventId);
        await expect(ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          1,
          100,
        )).to.be.revertedWith("Only organizers of this event can create ticket type");
      });
      it("Should delete a ticket type", async function () {
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        await ticketGenerator.connect(addr1).createEvent(eventId);
        await ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          1,
          100,
        );
        await ticketGenerator.connect(addr1).removeTicketType(eventId, ticketTypeId);
        await expect(ticketGenerator.getTicketType(eventId, ticketTypeId)).to.be.revertedWith("Ticket type does not exist");	
      });
    });

    describe("Ticket interactions", function () {
      it("Should buy a ticket", async function () {
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        await ticketGenerator.connect(addr1).createEvent(eventId);
        await ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          ethers.utils.parseEther("1"),
          100,
        )
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther("4.0") });
        preparedSignatureOwner = await generateSignature(owner.address, "1");
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignatureOwner.deadline,
          preparedSignatureOwner.v,
          preparedSignatureOwner.r,
          preparedSignatureOwner.s
        );
        expect((await ticketGenerator.getTicket(1)).owner).to.equal(owner.address);
      });
      it("Should transfer a ticket", async function () {
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        await ticketGenerator.connect(addr1).createEvent(eventId);
        await ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          ethers.utils.parseEther("1"),
          100,
        )
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther("4.0") });
        preparedSignatureOwner = await generateSignature(owner.address, "1");
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignatureOwner.deadline,
          preparedSignatureOwner.v,
          preparedSignatureOwner.r,
          preparedSignatureOwner.s
        );
        expect((await ticketGenerator.getTicket(1)).owner).to.equal(owner.address);
        await ticketGenerator.connect(owner).transferTicket(addr1.address, 1);
        expect((await ticketGenerator.getTicket(1)).owner).to.equal(addr1.address);
      });

      it("Should fetch ticket metadata", async function () {
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        await ticketGenerator.connect(addr1).createEvent(eventId);
        await ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          ethers.utils.parseEther("1"),
          100,
        )
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther("4.0") });
        preparedSignatureOwner = await generateSignature(owner.address, "1");
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignatureOwner.deadline,
          preparedSignatureOwner.v,
          preparedSignatureOwner.r,
          preparedSignatureOwner.s
        );
        expect((await ticketGenerator.getTicket(1)).owner).to.equal(owner.address);
        expect(await ticketGenerator.getMetadata(1)).to.equal("https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU");
      });
    });


    describe("utils tests", function () {
      it("Interface is supported", async function () {
        expect(await ticketGenerator.supportsInterface("0x01ffc9a7")).to.equal(true);
      });
      it("Interface is not supported", async function () {
        expect(await ticketGenerator.supportsInterface("0xffffffff")).to.equal(false);
      });
    });

    describe("Souvenir tests", function () {
      it("Should mint a souvenir", async function () {
const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));
        await ticketGenerator.connect(owner).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), addr1.address);
        await ticketGenerator.connect(addr1).createEvent(eventId);
        await ticketGenerator.connect(addr1).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          ethers.utils.parseEther("1"),
          100,
        )
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther("4.0") });
        preparedSignatureOwner = await generateSignature(owner.address, "1");
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignatureOwner.deadline,
          preparedSignatureOwner.v,
          preparedSignatureOwner.r,
          preparedSignatureOwner.s
        );
        expect((await ticketGenerator.getTicket(1)).owner).to.equal(owner.address);
        await ticketGenerator.connect(owner).getSouvenir(eventId, ticketTypeId, 1, owner.address)
        expect((await ticketGenerator.connect(owner).getTicket(1)).souvenirId).to.equal(0);
      });
    });

    describe("ETH Transactions", function () {
      it("Should deposit into the contract", async function () {
        const balanceBefore = await ethers.provider.getBalance(ticketGenerator.address);
        await ticketGenerator.connect(addr1).deposit({value: ethers.utils.parseEther("1.0")});
        const balanceAfter = await ethers.provider.getBalance(ticketGenerator.address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(ethers.utils.parseEther("1.0"));
      });

      it("Should withdraw from the contract", async function () {
        const eventId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId'));
        const ticketTypeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ticketTypeId'));


        await ticketGenerator.connect(owner).createEvent(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eventId')));
        await ticketGenerator.connect(owner).createTicketType(
          eventId,
          ticketTypeId,
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          "https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU",
          ethers.utils.parseEther("1"),
          100,
        );

        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther("4.0") });
        preparedSignatureAddr1 = await generateSignature(addr1.address, "1");
        
        await ticketGenerator.connect(addr1).buyTicket(
          eventId,
          ticketTypeId,
          addr1.address,
          preparedSignatureAddr1.deadline,
          preparedSignatureAddr1.v,
          preparedSignatureAddr1.r,
          preparedSignatureAddr1.s
        );

        const balanceBefore = await ethers.provider.getBalance(ticketGenerator.address);
        await ticketGenerator.connect(owner).withdraw();
        const balanceAfterWithdraw = await ethers.provider.getBalance(ticketGenerator.address);
        expect(balanceBefore.sub(balanceAfterWithdraw)).to.equal(ethers.utils.parseEther("1.0"));
      });
    });
  });
});