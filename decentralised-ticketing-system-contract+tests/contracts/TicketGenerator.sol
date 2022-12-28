// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Structs.sol";
import "./TIK.sol";
import "./SouvenirGenerator.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "hardhat/console.sol";

contract TicketGenerator is AccessControl, ERC721URIStorage {
    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed receiver, uint256 amount);
    event CreateEvent(
        address indexed creator,
        bytes32 eventId,
        string name,
        string description,
        bytes eventStorage
    );
    event CreateTicketType(
        address indexed creator,
        bytes32 eventId,
        Structs.TicketType ticketType
    );

    event DeleteEvent(address indexed creator, bytes32 eventId);

    event DeleteTickeyType(
        address indexed creator,
        bytes32 eventId,
        bytes32 ticketTypeId
    );

    event GenerateTicket(
        address indexed creator,
        address indexed receiver,
        uint256 tokenId,
        string tokenURI
    );
    event TransferTicket(
        address indexed sender,
        address indexed receiver,
        uint256 tokenId
    );

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    SouvenirGenerator private souvenirGenerator;
    TIK private token;

    bytes32[] private eventIds;
    mapping(bytes32 => Structs.Event) private events;

    uint256[] private ticketIds;
    mapping(uint256 => Structs.Ticket) private tickets;

    uint256 private currencySpent = 0;

    bytes32 public constant EVENT_ORGANIZER = keccak256("EVENT_ORGANIZER");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    uint256 private balance = 0;

    modifier eventExists(bytes32 _eventId) {
        require(events[_eventId].id != 0, "Event does not exist");
        _;
    }

    modifier ticketTypeExists(bytes32 _eventId, bytes32 _ticketTypeId) {
        require(
            events[_eventId].ticketTypes[_ticketTypeId].id != 0,
            "Ticket type does not exist"
        );
        _;
    }

    modifier onlyOrganizer() {
        require(
            hasRole(EVENT_ORGANIZER, msg.sender),
            "Only event organizers can call this function"
        );
        _;
    }

    modifier ticketExists(uint256 _tokenId) {
        require(_exists(_tokenId), "Ticket does not exist");
        _;
    }

    constructor(
        address _tokenAddress,
        address _souvenirGeneratorAddress
    ) ERC721("Ticket NFT", "NFT") {
        souvenirGenerator = SouvenirGenerator(_souvenirGeneratorAddress);
        token = TIK(_tokenAddress);
        _setupRole(OWNER_ROLE, msg.sender);
        _setupRole(EVENT_ORGANIZER, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getMetadata(uint256 _tokenId) public view returns (string memory) {
        return tokenURI(_tokenId);
    }

    function createEvent(
        bytes32 _eventId,
        string memory _name,
        string memory _description,
        bytes memory eventStorage
    ) external onlyOrganizer {
        require(events[_eventId].id == 0, "Event already exists");
        eventIds.push(_eventId);
        events[_eventId].id = _eventId;
        events[_eventId].organizers[msg.sender] = true;
        emit CreateEvent(
            msg.sender,
            _eventId,
            _name,
            _description,
            eventStorage
        );
    }

    function deleteEvent(
        bytes32 _eventId
    ) external eventExists(_eventId) onlyOrganizer {
        require(
            events[_eventId].organizers[msg.sender],
            "Only organizer can remove event"
        );
        require(
            events[_eventId].ticketTypeIds.length == 0,
            "Event still has ticket types"
        );
        delete events[_eventId];
        emit DeleteEvent(msg.sender, _eventId);
    }

    function createTicketType(
        bytes32 _eventId,
        bytes32 _ticketTypeId,
        string memory _tokenURI,
        string memory _souvenirTokenURI,
        uint256 _price,
        uint256 _maxSupply
    ) external eventExists(_eventId) onlyOrganizer {
        require(
            events[_eventId].organizers[msg.sender],
            "Only organizers of this event can create ticket type"
        );
        require(
            events[_eventId].ticketTypes[_ticketTypeId].id == 0,
            "Ticket type already exists"
        );
        Structs.TicketType memory ticketType = Structs.TicketType({
            id: _ticketTypeId,
            price: _price,
            maxSupply: _maxSupply,
            currentSupply: _maxSupply,
            tokenURI: _tokenURI,
            souvenirTokenURI: _souvenirTokenURI
        });
        events[_eventId].ticketTypes[_ticketTypeId] = ticketType;
        events[_eventId].ticketTypeIds.push(_ticketTypeId);
        emit CreateTicketType(msg.sender, _eventId, ticketType);
    }

    function removeTicketType(
        bytes32 _eventId,
        bytes32 _ticketTypeId
    )
        external
        eventExists(_eventId)
        ticketTypeExists(_eventId, _ticketTypeId)
        onlyOrganizer
    {
        require(
            events[_eventId].organizers[msg.sender],
            "Only organizer can remove ticket type"
        );
        delete events[_eventId].ticketTypes[_ticketTypeId];
        emit DeleteTickeyType(msg.sender, _eventId, _ticketTypeId);
    }

    function _mintNFT(
        address _recipient,
        string memory _tokenURI
    ) private returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        emit GenerateTicket(msg.sender, _recipient, newItemId, _tokenURI);
        return newItemId;
    }

    function buyTicket(
        bytes32 _eventId,
        bytes32 _ticketTypeId,
        address _recepient,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
        eventExists(_eventId)
        ticketTypeExists(_eventId, _ticketTypeId)
        returns (uint256)
    {
        Structs.TicketType storage ticketType = events[_eventId].ticketTypes[
            _ticketTypeId
        ];
        require(
            ticketType.currentSupply > 0,
            "Tickets from this type sold out"
        );
        token.permit(
            msg.sender,
            address(this),
            ticketType.price,
            deadline,
            v,
            r,
            s
        );
        require(
            token.allowance(msg.sender, address(this)) >= ticketType.price,
            "Token allowance too low"
        );
        bool success = token.transferFrom(
            msg.sender,
            address(this),
            ticketType.price
        );
        require(success, "transfer failed");
        ticketType.currentSupply--;
        uint256 tokenId = _mintNFT(_recepient, ticketType.tokenURI);
        Structs.Ticket memory ticket;
        ticket.id = tokenId;
        ticket.eventId = _eventId;
        ticket.ticketTypeId = _ticketTypeId;
        ticket.owner = _recepient;
        tickets[tokenId] = ticket;
        ticketIds.push(tokenId);
        currencySpent += ticketType.price;
        return tokenId;
    }

    function getSouvenir(
        bytes32 _eventId,
        bytes32 _ticketTypeId,
        uint256 _ticketId,
        address _recepient
    )
        external
        eventExists(_eventId)
        ticketTypeExists(_eventId, _ticketTypeId)
        ticketExists(_ticketId)
        returns (uint256)
    {
        Structs.Ticket memory ticket = tickets[_ticketId];
        require(!ticket.souvenirMinted, "Souvenir already minted");
        uint256 souvenirId = souvenirGenerator.generateSouvenir(
            _recepient,
            events[_eventId].ticketTypes[_ticketTypeId].souvenirTokenURI
        );
        ticket.souvenirMinted = true;
        ticket.souvenirId = souvenirId;
        console.log("%s", souvenirId);
        return souvenirId;
    }

    function deposit() public payable {
        token.mint(msg.sender, msg.value);
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external {
        require(hasRole(OWNER_ROLE, msg.sender), "Caller is not an owner");
        require(currencySpent > 0, "No fees to be withdrawn");
        bool success = payable(msg.sender).send(currencySpent);
        require(success, "send failed");
        token.burn(address(this), currencySpent);
        emit Withdraw(msg.sender, currencySpent);
        balance -= currencySpent;
        currencySpent = 0;
    }

    function transferTicket(address _recepient, uint256 _tokenId) external {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _transfer(msg.sender, _recepient, _tokenId);
        tickets[_tokenId].owner = _recepient;
        emit TransferTicket(msg.sender, _recepient, _tokenId);
    }

    function getEvent(
        bytes32 _eventId
    ) external view eventExists(_eventId) returns (bytes32) {
        return events[_eventId].id;
    }

    function getTicketType(
        bytes32 _eventId,
        bytes32 _ticketTypeId
    )
        external
        view
        eventExists(_eventId)
        ticketTypeExists(_eventId, _ticketTypeId)
        returns (Structs.TicketType memory)
    {
        return events[_eventId].ticketTypes[_ticketTypeId];
    }

    function getTicket(
        uint256 _ticketId
    ) external view ticketExists(_ticketId) returns (Structs.Ticket memory) {
        return tickets[_ticketId];
    }
}
