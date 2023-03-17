const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Ticket NFT generator', function () {
  const testCid = 'EXAMPLE CID';
  const testName = 'Test';
  const testDescription = 'Test Description';
  let TicketGenerator;
  let ticketGenerator;
  let SouvenirGenerator;
  let souvenirGenerator;
  let TikToken;
  let tikToken;
  let owner;
  let addr1;
  let preparedSignature;

  async function generateSignature(address, value) {
    const nonce = await tikToken.nonces(address); // Our Token Contract Nonces
    const deadline = +new Date() + 60 * 60; // Permit with deadline which the permit is valid
    const wrapValue = ethers.utils.parseEther(value); // Value to approve for the spender to use

    const EIP712Domain = [
      // array of objects -> properties from the contract and the types of them ircwithPermit
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' },
    ];

    const domain = {
      name: await tikToken.name(),
      version: '1',
      verifyingContract: tikToken.address,
    };

    const Permit = [
      // array of objects -> properties from erc20withpermit
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    const message = {
      owner: address,
      spender: ticketGenerator.address,
      value: wrapValue.toString(),
      nonce: nonce.toHexString(),
      deadline,
    };

    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    const signatureLike = await ticketGenerator.provider.send('eth_signTypedData_v4', [
      address,
      data,
    ]);
    const signature = await ethers.utils.splitSignature(signatureLike);

    return {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      deadline,
    };
  }
  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    TikToken = await ethers.getContractFactory('TIK');
    SouvenirGenerator = await ethers.getContractFactory('SouvenirGenerator');
    TicketGenerator = await ethers.getContractFactory('TicketGenerator');
  });

  beforeEach(async function () {
    tikToken = await TikToken.deploy();
    await tikToken.deployed();
    souvenirGenerator = await SouvenirGenerator.deploy();
    await souvenirGenerator.deployed();
    ticketGenerator = await TicketGenerator.deploy(tikToken.address, souvenirGenerator.address);
    await ticketGenerator.deployed();
    await souvenirGenerator.setTicketContractAddress(ticketGenerator.address);
    await tikToken.setTicketContractAddress(ticketGenerator.address);
  });

  describe('TicketGenerator tests', function () {
    describe('Utils', function () {
      it('Should set the right TIK contract address', async function () {
        await ticketGenerator.setTIKContract(tikToken.address);
      });
      it('Should set the right souvenir contract address', async function () {
        await ticketGenerator.setSouvenirGeneratorContract(souvenirGenerator.address);
      });
      it('Should set the right organizer fee', async function () {
        await ticketGenerator.setOrganizerDeposit(10);
      });
      it('Should revert because caller is not the owner', async function () {
        await expect(
          ticketGenerator.connect(addr1).setTIKContract(tikToken.address),
        ).to.be.revertedWith(
          `AccessControl: account ${addr1.address.toLowerCase()} is missing role 0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e`,
        );
      });
      it('Should revert because caller is not the owner', async function () {
        await expect(
          ticketGenerator.connect(addr1).setSouvenirGeneratorContract(souvenirGenerator.address),
        ).to.be.revertedWith(
          `AccessControl: account ${addr1.address.toLowerCase()} is missing role 0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e`,
        );
      });
      it('Should revert because caller is not the owner', async function () {
        await expect(ticketGenerator.connect(addr1).setOrganizerDeposit(10)).to.be.revertedWith(
          `AccessControl: account ${addr1.address.toLowerCase()} is missing role 0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e`,
        );
      });
    });

    describe('Access Control', function () {
      it('Should set the right owner', async function () {
        expect(
          await ticketGenerator.hasRole(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')),
            owner.address,
          ),
        ).to.equal(true);
      });

      it('Should grant the right role', async function () {
        await ticketGenerator.grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
        expect(
          await ticketGenerator.hasRole(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
            addr1.address,
          ),
        ).to.equal(true);
      });
    });
    describe('Events', function () {
      describe('Create Event', function () {
        it('Should create an event', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await expect(
            ticketGenerator
              .connect(addr1)
              .createEvent(
                testName,
                testDescription,
                testCid,
                'Sofia',
                0,
                0,
                'testcat',
                'testSubCat',
              ),
          )
            .to.emit(ticketGenerator, 'CreateEvent')
            .withArgs(
              addr1.address,
              eventId,
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
        });
        it('Should revert because user is not an organizer and cannot an event', async function () {
          await expect(
            ticketGenerator
              .connect(addr1)
              .createEvent(
                testName,
                testDescription,
                testCid,
                'Sofia',
                0,
                0,
                'testcat',
                'testSubCat',
              ),
          ).to.be.revertedWith(
            `AccessControl: account ${addr1.address.toLowerCase()} is missing role 0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63`,
          );
        });
        it('Should revert because event already exists', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(
            ticketGenerator
              .connect(addr1)
              .createEvent(
                testName,
                testDescription,
                testCid,
                'Sofia',
                0,
                0,
                'testcat',
                'testSubCat',
              ),
          ).to.be.revertedWith('Event already exists');
        });
      });
      describe('Update Event', function () {
        it('Should update an event', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(
            ticketGenerator
              .connect(addr1)
              .updateEvent(eventId, testName, testDescription, testCid, 'Sofiaadasd', 0, 0),
          )
            .to.emit(ticketGenerator, 'UpdateEvent')
            .withArgs(
              addr1.address,
              eventId,
              testName,
              testDescription,
              testCid,
              'Sofiaadasd',
              0,
              0,
            );
        });

        it('Should revert because user is not an organizer and cannot update an event', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(
            ticketGenerator
              .connect(owner)
              .updateEvent(eventId, testName, testDescription, testCid, 'Sofiaadasd', 0, 0),
          ).to.be.revertedWith(
            `AccessControl: account ${owner.address.toLowerCase()} is missing role 0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63`,
          );
        });
        it('Should revert because event does not exist', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await expect(
            ticketGenerator
              .connect(owner)
              .updateEvent(eventId, testName, testDescription, testCid, 'Sofiaadasd', 0, 0),
          ).to.be.revertedWith('Event does not exist');
        });
        it('Should revert because user is not the event organizer', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              owner.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(
            ticketGenerator
              .connect(owner)
              .updateEvent(eventId, testName, testDescription, testCid, 'Sofiaadasd', 0, 0),
          ).to.be.revertedWith('Only organizer can edit event');
        });
      });
      describe('Delete Event', function () {
        it('Should delete an event', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(ticketGenerator.connect(addr1).deleteEvent(eventId))
            .to.emit(ticketGenerator, 'DeleteEvent')
            .withArgs(addr1.address, eventId);
        });
        it('Should revert because user is not an organizer and cannot delete an event', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(ticketGenerator.connect(owner).deleteEvent(eventId)).to.be.revertedWith(
            `AccessControl: account ${owner.address.toLowerCase()} is missing role 0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63`,
          );
        });
        it('Should revert because event does not exist', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await expect(ticketGenerator.connect(owner).deleteEvent(eventId)).to.be.revertedWith(
            'Event does not exist',
          );
        });
        it('Should revert because user is not the event organizer', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              owner.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(ticketGenerator.connect(owner).deleteEvent(eventId)).to.be.revertedWith(
            'Only organizer can remove event',
          );
        });
        it('Should revert because event still has ticket types', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              owner.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await ticketGenerator
            .connect(addr1)
            .createTicketType(
              eventId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              ethers.utils.parseEther('0.001'),
              100,
            );
          await expect(ticketGenerator.connect(addr1).deleteEvent(eventId)).to.be.revertedWith(
            'Event still has ticket types',
          );
        });
      });
    });
    describe('Ticket Types', function () {
      describe('Create Ticket Type', function () {
        it('Should create a ticket type', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          const tx = await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          const result = await tx.wait();

          await ticketGenerator
            .connect(addr1)
            .createTicketType(
              eventId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              ethers.utils.parseEther('0.001'),
              100,
            );
          await ticketGenerator
            .connect(addr1)
            .createTicketType(
              eventId,
              testName + 'asd',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              ethers.utils.parseEther('0.002'),
              10,
            );
        });
        it('Should revert because event does not exist', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await expect(
            ticketGenerator
              .connect(addr1)
              .createTicketType(
                eventId,
                testName,
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                1,
                100,
              ),
          ).to.be.revertedWith('Event does not exist');
        });
        it('Should revert because user is not an organizer for this and cannot create a ticket type', async function () {
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('1') });
          await ticketGenerator.connect(owner).becomeOrganizer();
          await ticketGenerator
            .connect(owner)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(
            ticketGenerator
              .connect(addr1)
              .createTicketType(
                eventId,
                testName,
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                1,
                100,
              ),
          ).to.be.revertedWith(
            `AccessControl: account ${addr1.address.toLowerCase()} is missing role 0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63`,
          );
        });
        it('Should revert because user is not an organizer and cannot create a ticket type', async function () {
          await ticketGenerator
            .connect(owner)
            .grantRole(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
              addr1.address,
            );

          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('1') });
          await ticketGenerator.connect(owner).becomeOrganizer();
          await ticketGenerator
            .connect(owner)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await expect(
            ticketGenerator
              .connect(addr1)
              .createTicketType(
                eventId,
                testName,
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                1,
                100,
              ),
          ).to.be.revertedWith('Only the organizer of this event can create ticket type');
        });
        it('Should revert because ticket type already exists', async function () {
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
          await ticketGenerator.connect(addr1).becomeOrganizer();
          await ticketGenerator
            .connect(addr1)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await ticketGenerator
            .connect(addr1)
            .createTicketType(
              eventId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              1,
              100,
            );
          await expect(
            ticketGenerator
              .connect(addr1)
              .createTicketType(
                eventId,
                testName,
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
                1,
                100,
              ),
          ).to.be.revertedWith('Ticket type already exists');
        });
      });
    });
    describe('Update ticket type', function () {
      it('Should update a ticket type', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(addr1)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            1,
            100,
          );
        await expect(
          ticketGenerator
            .connect(addr1)
            .updateTicketType(
              eventId,
              ticketTypeId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              1,
              10000,
            ),
        ).to.emit(ticketGenerator, 'UpdateTicketType');
      });
      it('Should revert because event does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await expect(
          ticketGenerator
            .connect(addr1)
            .updateTicketType(
              eventId,
              ticketTypeId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              1,
              10000,
            ),
        ).to.be.revertedWith('Event does not exist');
      });

      it('Should revert because ticket type does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await expect(
          ticketGenerator
            .connect(addr1)
            .updateTicketType(
              eventId,
              ticketTypeId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              1,
              10000,
            ),
        ).to.be.revertedWith('Ticket type does not exist');
      });
      it('Should revert because user is no the organizer of this event', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(addr1)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            1,
            100,
          );
        await expect(
          ticketGenerator
            .connect(owner)
            .updateTicketType(
              eventId,
              ticketTypeId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              1,
              10000,
            ),
        ).to.be.revertedWith('Only the organizer can edit ticket types');
      });
      it('Should revert because user does not have organizer role', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(addr1)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            1,
            100,
          );
        await expect(
          ticketGenerator
            .connect(owner)
            .updateTicketType(
              eventId,
              ticketTypeId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              1,
              10000,
            ),
        ).to.be.revertedWith(
          `AccessControl: account ${owner.address.toLowerCase()} is missing role 0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63`,
        );
      });
    });

    describe('Delete ticket type', function () {
      it('Should delete a ticket type', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator
          .connect(owner)
          .grantRole(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
            addr1.address,
          );
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(addr1)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            1,
            100,
          );
        await ticketGenerator.connect(addr1).deleteTicketType(eventId, ticketTypeId);
      });
      it('Should revert because event does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await expect(
          ticketGenerator.connect(addr1).deleteTicketType(eventId, ticketTypeId),
        ).to.be.revertedWith('Event does not exist');
      });

      it('Should revert because ticket type does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await expect(
          ticketGenerator.connect(addr1).deleteTicketType(eventId, ticketTypeId),
        ).to.be.revertedWith('Ticket type does not exist');
      });
      it('Should revert because user is no the organizer of this event', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(addr1)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            1,
            100,
          );
        await expect(
          ticketGenerator.connect(owner).deleteTicketType(eventId, ticketTypeId),
        ).to.be.revertedWith('Only the organizer can remove ticket types');
      });
      it('Should revert because user does not have organizer role', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1') });
        await ticketGenerator.connect(addr1).becomeOrganizer();
        await ticketGenerator
          .connect(addr1)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(addr1)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            1,
            100,
          );
        await expect(
          ticketGenerator.connect(owner).deleteTicketType(eventId, ticketTypeId),
        ).to.be.revertedWith(
          `AccessControl: account ${owner.address.toLowerCase()} is missing role 0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63`,
        );
      });
    });
  });

  describe('Ticket interactions', function () {
    it('Should buy a ticket', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await expect(
        ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        ),
      ).to.emit(ticketGenerator, 'BuyTicket');
    });
    it('Should buy 2 tickets', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '2');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('2'),
      );
      await expect(
        ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          0,
          0,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          0,
        ),
      ).to.emit(ticketGenerator, 'BuyTicket');
    });
    it('Should use ticket', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(addr1).useTicket(1)).to.emit(
        ticketGenerator,
        'UseTicket',
      );
      const eventId2 = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName + 'asd']),
      );
      await ticketGenerator
        .connect(addr1)
        .createEvent(
          testName + 'asd',
          testDescription,
          testCid,
          'Sofia',
          0,
          10000000000000,
          'testcat',
          'testSubCat',
        );
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId2,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      const ticketTypeId2 = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId2, testName]),
      );
      await ticketGenerator.buyTicket(
        eventId2,
        ticketTypeId2,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(addr1).useTicket(2)).to.emit(
        ticketGenerator,
        'UseTicket',
      );
    });
    it('Should revert beacuse user does not have organizer role', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(owner).useTicket(1)).to.be.revertedWith(
        'AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63',
      );
    });
    it('Should revert because event has ended', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 1, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(addr1).useTicket(1)).to.be.revertedWith(
        'Event has ended',
      );
    });
    it('Should revert because ticket is already used', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await ticketGenerator.connect(addr1).useTicket(1);
      await expect(ticketGenerator.connect(addr1).useTicket(1)).to.be.rejectedWith(
        'Ticket is already used',
      );
    });
    it('Should revert because ticket does not exist', async function () {
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await expect(ticketGenerator.connect(addr1).useTicket(1)).to.be.revertedWith(
        'Ticket does not exist',
      );
    });
    it('Should revert because user is not the organizer of this event', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          owner.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(owner).useTicket(1)).to.be.revertedWith(
        'Not the organizer',
      );
    });
    it('Should revert because the event has not started', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(
          testName,
          testDescription,
          testCid,
          'Sofia',
          100000000000000,
          0,
          'testcat',
          'testSubCat',
        );
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(addr1).useTicket(1)).to.be.revertedWith(
        'Event has not started',
      );
    });
    it('Should revert because event does not exist', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await expect(
        ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        ),
      ).to.be.revertedWith('Event does not exist');
    });
    it('Should revert because ticket type does not exist', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await expect(
        ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        ),
      ).to.be.revertedWith('Ticket type does not exist');
    });
    it('Should revert because tickets ran out', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          1,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '2');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('2'),
      );
      await expect(
        ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          0,
          0,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          0,
        ),
      ).to.be.revertedWith('Tickets from this type sold out');
    });
    it('Should revert because token allowence is too low', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '0.1');
      await expect(
        ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('0.1'),
        ),
      ).to.be.revertedWith('Token allowance too low');
    });
    it('Should fetch ticket metadata', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator
        .connect(owner)
        .grantRole(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ORGANIZER_ROLE')),
          addr1.address,
        );
      await ticketGenerator
        .connect(addr1)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(addr1)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      expect(await ticketGenerator.tokenURI(1)).to.equal(
        'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
      );
    });
  });

  describe('Owner utils tests', function () {
    it('Interface is supported', async function () {
      expect(await ticketGenerator.supportsInterface('0x01ffc9a7')).to.equal(true);
    });
    it('Interface is not supported', async function () {
      expect(await ticketGenerator.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('Souvenir tests', function () {
    it('Should mint a souvenir', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(owner).becomeOrganizer();
      await ticketGenerator
        .connect(owner)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(owner)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await ticketGenerator.connect(owner).useTicket(1);
      await expect(ticketGenerator.connect(owner).getSouvenir(1)).to.emit(
        ticketGenerator,
        'GenerateSouvenir',
      );
    });
    it("Should fetch a souvenir's metadata", async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(owner).becomeOrganizer();
      await ticketGenerator
        .connect(owner)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(owner)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await ticketGenerator.connect(owner).useTicket(1);
      await ticketGenerator.connect(owner).getSouvenir(1);
      expect(await souvenirGenerator.connect(owner).tokenURI(1)).to.equal(
        'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
      );
    });
    it('Should revert because ticket does not exist', async function () {
      await expect(ticketGenerator.connect(owner).getSouvenir(1)).to.be.revertedWith(
        'Ticket does not exist',
      );
    });
    it('Should revert because user is not ticket owner', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(owner).becomeOrganizer();
      await ticketGenerator
        .connect(owner)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(owner)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(addr1).getSouvenir(1)).to.be.revertedWith(
        'Only ticket owner can call this function',
      );
    });
    it('Should revert because souvenir has already been minted', async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(owner).becomeOrganizer();
      await ticketGenerator
        .connect(owner)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(owner)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await ticketGenerator.connect(owner).useTicket(1);
      await ticketGenerator.connect(owner).getSouvenir(1);

      await expect(ticketGenerator.connect(owner).getSouvenir(1)).to.be.revertedWith(
        'Souvenir already minted',
      );
    });
    it("Should revert because the ticket still hasn't been used", async function () {
      const eventId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
      );
      const ticketTypeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
      );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(owner).becomeOrganizer();
      await ticketGenerator
        .connect(owner)
        .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
      await ticketGenerator
        .connect(owner)
        .createTicketType(
          eventId,
          testName,
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
          ethers.utils.parseEther('1'),
          100,
        );
      await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
      preparedSignature = await generateSignature(owner.address, '1');
      await ticketGenerator.buyTicket(
        eventId,
        ticketTypeId,
        owner.address,
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s,
        ethers.utils.parseEther('1'),
      );
      await expect(ticketGenerator.connect(owner).getSouvenir(1)).to.be.revertedWith(
        "Ticket still hasn't been used",
      );
    });
  });
  describe('Marketplace transactiobs', function () {
    describe('Buy offer', function () {
      it('Should create a buy offer', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await expect(
          ticketGenerator
            .connect(owner)
            .createBuyOffer(
              eventId,
              ticketTypeId,
              ethers.utils.parseEther('1'),
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ),
        ).to.emit(ticketGenerator, 'CreateBuyOffer');
      });
      it('Should accept a buy offer', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        const offerId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['address', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32'],
            [
              owner.address,
              eventId,
              ticketTypeId,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ],
          ),
        );
        await ticketGenerator
          .connect(owner)
          .createBuyOffer(
            eventId,
            ticketTypeId,
            ethers.utils.parseEther('1'),
            preparedSignature.deadline,
            preparedSignature.v,
            preparedSignature.r,
            preparedSignature.s,
          );
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(addr1.address, '1');
        await ticketGenerator
          .connect(addr1)
          .buyTicket(
            eventId,
            ticketTypeId,
            addr1.address,
            preparedSignature.deadline,
            preparedSignature.v,
            preparedSignature.r,
            preparedSignature.s,
            ethers.utils.parseEther('1'),
          );
        await expect(ticketGenerator.connect(addr1).acceptBuyOffer(offerId, 1)).to.emit(
          ticketGenerator,
          'AcceptBuyOffer',
        );
      });
      it('Should revert because event does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        preparedSignature = await generateSignature(addr1.address, '1');
        await expect(
          ticketGenerator
            .connect(owner)
            .createBuyOffer(
              eventId,
              ticketTypeId,
              ethers.utils.parseEther('1'),
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ),
        ).to.be.revertedWith('Event does not exist');
      });

      it('Should revert because ticket type does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        preparedSignature = await generateSignature(addr1.address, '1');
        await expect(
          ticketGenerator
            .connect(owner)
            .createBuyOffer(
              eventId,
              ticketTypeId,
              ethers.utils.parseEther('1'),
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ),
        ).to.be.revertedWith('Ticket type does not exist');
      });
      it('Should revert because you cannot accept your own buy offer', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        const offerId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['address', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32'],
            [
              owner.address,
              eventId,
              ticketTypeId,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ],
          ),
        );
        await ticketGenerator
          .connect(owner)
          .createBuyOffer(
            eventId,
            ticketTypeId,
            ethers.utils.parseEther('1'),
            preparedSignature.deadline,
            preparedSignature.v,
            preparedSignature.r,
            preparedSignature.s,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await ticketGenerator
          .connect(owner)
          .buyTicket(
            eventId,
            ticketTypeId,
            addr1.address,
            preparedSignature.deadline,
            preparedSignature.v,
            preparedSignature.r,
            preparedSignature.s,
            ethers.utils.parseEther('1'),
          );
        await expect(ticketGenerator.connect(owner).acceptBuyOffer(offerId, 1)).to.be.revertedWith(
          'Cannot buy your own ticket',
        );
      });
      it('Should revert because offer does not exist', async function () {
        const offerId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('offerId'));
        await expect(ticketGenerator.connect(owner).acceptBuyOffer(offerId, 1)).to.be.revertedWith(
          'Offer does not exist',
        );
      });
    });
    describe('Sell offer', function () {
      it('Should create a sell offer', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        );
        await expect(
          ticketGenerator
            .connect(owner)
            .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1')),
        ).to.emit(ticketGenerator, 'CreateSellOffer');
      });
      it('Should revert because offer already exists', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        );
        await ticketGenerator
          .connect(owner)
          .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1'));
        await expect(
          ticketGenerator
            .connect(owner)
            .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1')),
        ).to.be.revertedWith('Sell offer already exists for this ticket');
      });
      it('Should revert because event does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );

        await expect(
          ticketGenerator
            .connect(owner)
            .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1')),
        ).to.be.revertedWith('Event does not exist');
      });

      it('Should revert because ticket type does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await expect(
          ticketGenerator
            .connect(owner)
            .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1')),
        ).to.be.revertedWith('Ticket type does not exist');
      });

      it('Should revert because ticket does not exist', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await expect(
          ticketGenerator
            .connect(owner)
            .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1')),
        ).to.be.revertedWith('Ticket does not exist');
      });

      it('Should revert because user is not the ticket owner', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        );

        await expect(
          ticketGenerator
            .connect(addr1)
            .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1')),
        ).to.be.revertedWith('Only ticket owner can call this function');
      });
      it('Should accept offer', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        );
        const offerId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['address', 'bytes32', 'bytes32', 'uint256'],
            [owner.address, eventId, ticketTypeId, 1],
          ),
        );
        await ticketGenerator
          .connect(owner)
          .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1'));

        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(addr1.address, '1');
        await expect(
          ticketGenerator
            .connect(addr1)
            .acceptSellOffer(
              offerId,
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ),
        ).to.emit(ticketGenerator, 'AcceptSellOffer');
      });
      it('Should revert because offer does not exist', async function () {
        const offerId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('offerId'));
        await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(addr1.address, '1');
        await expect(
          ticketGenerator
            .connect(addr1)
            .acceptSellOffer(
              offerId,
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ),
        ).to.be.revertedWith('Offer does not exist');
      });
      it('Should revert because you cannot accept your own offer', async function () {
        const eventId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
        );
        const ticketTypeId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
        );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        await ticketGenerator.connect(owner).becomeOrganizer();
        await ticketGenerator
          .connect(owner)
          .createEvent(testName, testDescription, testCid, 'Sofia', 0, 0, 'testcat', 'testSubCat');
        await ticketGenerator
          .connect(owner)
          .createTicketType(
            eventId,
            testName,
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
            ethers.utils.parseEther('1'),
            100,
          );
        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await ticketGenerator.buyTicket(
          eventId,
          ticketTypeId,
          owner.address,
          preparedSignature.deadline,
          preparedSignature.v,
          preparedSignature.r,
          preparedSignature.s,
          ethers.utils.parseEther('1'),
        );
        const offerId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['address', 'bytes32', 'bytes32', 'uint256'],
            [owner.address, eventId, ticketTypeId, 1],
          ),
        );
        await ticketGenerator
          .connect(owner)
          .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1'));

        await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
        preparedSignature = await generateSignature(owner.address, '1');
        await expect(
          ticketGenerator
            .connect(owner)
            .acceptSellOffer(
              offerId,
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            ),
        ).to.be.revertedWith('Cannot buy your own ticket');
      });
      describe('Cancel Offer', function () {
        it('Should cancel offer', async function () {
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          const ticketTypeId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
          );
          await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
          await ticketGenerator.connect(owner).becomeOrganizer();
          await ticketGenerator
            .connect(owner)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await ticketGenerator
            .connect(owner)
            .createTicketType(
              eventId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              ethers.utils.parseEther('1'),
              100,
            );
          await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
          preparedSignature = await generateSignature(owner.address, '1');
          const offerId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
              ['address', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32'],
              [
                owner.address,
                eventId,
                ticketTypeId,
                preparedSignature.v,
                preparedSignature.r,
                preparedSignature.s,
              ],
            ),
          );
          await ticketGenerator
            .connect(owner)
            .createBuyOffer(
              eventId,
              ticketTypeId,
              ethers.utils.parseEther('1'),
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            );
          await expect(ticketGenerator.connect(owner).cancelOffer(offerId)).to.emit(
            ticketGenerator,
            'CancelOffer',
          );
          await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
          preparedSignature = await generateSignature(owner.address, '1');
          await ticketGenerator.buyTicket(
            eventId,
            ticketTypeId,
            owner.address,
            preparedSignature.deadline,
            preparedSignature.v,
            preparedSignature.r,
            preparedSignature.s,
            ethers.utils.parseEther('1'),
          );
          const offerId2 = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
              ['address', 'bytes32', 'bytes32', 'uint256'],
              [owner.address, eventId, ticketTypeId, 1],
            ),
          );
          await ticketGenerator
            .connect(owner)
            .createSellOffer(eventId, ticketTypeId, 1, ethers.utils.parseEther('1'));
          await expect(ticketGenerator.connect(owner).cancelOffer(offerId2)).to.emit(
            ticketGenerator,
            'CancelOffer',
          );
        });
        it('Should revert because offer does not exist', async function () {
          const offerId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('offerId'));
          await expect(ticketGenerator.connect(owner).cancelOffer(offerId)).to.be.revertedWith(
            'Offer does not exist',
          );
        });
        it('Should revert because offer is not yours', async function () {
          const eventId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['string'], [testName]),
          );
          const ticketTypeId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [eventId, testName]),
          );

          await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
          await ticketGenerator.connect(owner).becomeOrganizer();
          await ticketGenerator
            .connect(owner)
            .createEvent(
              testName,
              testDescription,
              testCid,
              'Sofia',
              0,
              0,
              'testcat',
              'testSubCat',
            );
          await ticketGenerator
            .connect(owner)
            .createTicketType(
              eventId,
              testName,
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              'https://gateway.pinata.cloud/ipfs/QmUkwQwYJT7TKLvQfLCppJdQq7KSCpWmszvs47yRwUN5tU',
              ethers.utils.parseEther('1'),
              100,
            );
          await ticketGenerator.connect(owner).deposit({ value: ethers.utils.parseEther('4.0') });
          preparedSignature = await generateSignature(owner.address, '1');
          const offerId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
              ['address', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32'],
              [
                owner.address,
                eventId,
                ticketTypeId,
                preparedSignature.v,
                preparedSignature.r,
                preparedSignature.s,
              ],
            ),
          );
          await ticketGenerator
            .connect(owner)
            .createBuyOffer(
              eventId,
              ticketTypeId,
              ethers.utils.parseEther('1'),
              preparedSignature.deadline,
              preparedSignature.v,
              preparedSignature.r,
              preparedSignature.s,
            );
          await expect(ticketGenerator.connect(addr1).cancelOffer(offerId)).to.be.revertedWith(
            'Not the creator of the offer',
          );
        });
      });
    });
  });
  describe('ETH Transactions', function () {
    it('Should deposit into the contract', async function () {
      const balanceBefore = await ethers.provider.getBalance(ticketGenerator.address);
      await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('1.0') });
      const balanceAfter = await ethers.provider.getBalance(ticketGenerator.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(ethers.utils.parseEther('1.0'));
    });

    it('Should buy organizer role', async function () {
      await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(addr1).becomeOrganizer();
    });

    it('Should revert because aller is already an organizer', async function () {
      await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(addr1).becomeOrganizer();
      await expect(ticketGenerator.connect(addr1).becomeOrganizer()).to.be.revertedWith(
        'Caller is already an organizer',
      );
    });
    it('Should revert because aller is already an organizer', async function () {
      await expect(ticketGenerator.connect(addr1).becomeOrganizer()).to.be.revertedWith(
        'Not enough tokens to become organizer',
      );
    });

    it('Should withdraw the fees to the owner from the contract', async function () {
      await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('4.0') });
      await ticketGenerator.connect(addr1).becomeOrganizer();

      const balanceBefore = await ethers.provider.getBalance(ticketGenerator.address);
      await ticketGenerator.connect(owner).ownerWithdraw();
      const balanceAfterWithdraw = await ethers.provider.getBalance(ticketGenerator.address);
      expect(balanceBefore.sub(balanceAfterWithdraw)).to.equal(ethers.utils.parseEther('0.001'));
    });
    it('Should revert beacause there are no fees to be taken from the contract', async function () {
      await expect(ticketGenerator.connect(owner).ownerWithdraw()).to.be.revertedWith(
        'Not enough to be withdrawn',
      );
    });

    it('Should revert because the user is not the owner', async function () {
      await expect(ticketGenerator.connect(addr1).ownerWithdraw()).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role 0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e`,
      );
    });

    it('Should withdraw to a user from the contract', async function () {
      await ticketGenerator.connect(addr1).deposit({ value: ethers.utils.parseEther('4.0') });
      await expect(
        ticketGenerator.connect(addr1).userWithdraw(ethers.utils.parseEther('1')),
      ).to.emit(ticketGenerator, 'Withdraw');
    });

    it('Should revert because the user does not have enough to withdraw', async function () {
      await expect(
        ticketGenerator.connect(addr1).userWithdraw(ethers.utils.parseEther('1')),
      ).to.be.revertedWith('Not enough to be withdrawn');
    });
  });
});
