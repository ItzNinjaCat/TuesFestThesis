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
        string eventStorage,
        uint256 startTime,
        uint256 endTime
    );

    event UpdateEvent(
        address indexed creator,
        bytes32 eventId,
        string name,
        string description,
        string eventStorage,
        uint256 startTime,
        uint256 endTime
    );

    event DeleteEvent(address indexed creator, bytes32 eventId);

    event CreateTicketType(
        address indexed creator,
        bytes32 eventId,
        Structs.TicketType ticketType
    );

    event UpdateTicketType(
        address indexed creator,
        bytes32 eventId,
        Structs.TicketType ticketType
    );

    event DeleteTickeyType(
        address indexed creator,
        bytes32 eventId,
        bytes32 ticketTypeId
    );

    event BuyTicket(
        address indexed buyer,
        address indexed owner,
        bytes32 eventId,
        bytes32 ticketTypeId,
        uint256 tokenId,
        string tokenURI,
        uint256 eventStartTime
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

    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    uint256 private balance = 0;
    uint256 private withdrawableBalance = 0;
    uint256 private organizerDeposit = 0.001 ether;

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
            hasRole(ORGANIZER_ROLE, msg.sender),
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
        _setupRole(ORGANIZER_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setTIKContract(address _tokenAddress) external {
        require(
            hasRole(OWNER_ROLE, msg.sender),
            "Only owner can call this function"
        );
        token = TIK(_tokenAddress);
    }

    function setSouvenirGeneratorContract(
        address _souvenirGeneratorAddress
    ) external {
        require(
            hasRole(OWNER_ROLE, msg.sender),
            "Only owner can call this function"
        );
        souvenirGenerator = SouvenirGenerator(_souvenirGeneratorAddress);
    }

    function setOrganizerDeposit(uint256 _organizerDeposit) external {
        require(
            hasRole(OWNER_ROLE, msg.sender),
            "Only owner can call this function"
        );
        organizerDeposit = _organizerDeposit;
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
        string memory eventStorage,
        uint256 startTime,
        uint256 endTime
    ) external onlyOrganizer {
        require(events[_eventId].id == 0, "Event already exists");
        eventIds.push(_eventId);
        events[_eventId].id = _eventId;
        events[_eventId].organizer = msg.sender;
        events[_eventId].name = _name;
        events[_eventId].description = _description;
        events[_eventId].eventStorage = eventStorage;
        events[_eventId].startTime = startTime;
        events[_eventId].endTime = endTime;
        emit CreateEvent(
            msg.sender,
            _eventId,
            _name,
            _description,
            eventStorage,
            startTime,
            endTime
        );
    }

    function updateEvent(
        bytes32 _eventId,
        string memory _name,
        string memory _description,
        string memory eventStorage,
        uint256 startTime,
        uint256 endTime
    ) external eventExists(_eventId) onlyOrganizer {
        require(
            events[_eventId].organizer == msg.sender,
            "Only organizer can edit event"
        );
        events[_eventId].name = _name;
        events[_eventId].description = _description;
        events[_eventId].eventStorage = eventStorage;
        events[_eventId].startTime = startTime;
        events[_eventId].endTime = endTime;
        emit UpdateEvent(
            msg.sender,
            _eventId,
            _name,
            _description,
            eventStorage,
            startTime,
            endTime
        );
    }

    function deleteEvent(
        bytes32 _eventId
    ) external eventExists(_eventId) onlyOrganizer {
        require(
            events[_eventId].organizer == msg.sender,
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
        string memory _ticketName,
        string memory _tokenURI,
        string memory _souvenirTokenURI,
        uint256 _price,
        uint256 _maxSupply
    ) external eventExists(_eventId) onlyOrganizer {
        require(
            events[_eventId].organizer == msg.sender,
            "Only the organizer of this event can create ticket type"
        );
        require(
            events[_eventId].ticketTypes[_ticketTypeId].id == 0,
            "Ticket type already exists"
        );
        Structs.TicketType memory ticketType = Structs.TicketType({
            id: _ticketTypeId,
            name: _ticketName,
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

    function updateTicketType(
        bytes32 _eventId,
        bytes32 _ticketTypeId,
        string memory _ticketName,
        string memory _tokenURI,
        string memory _souvenirTokenURI,
        uint256 _price,
        uint256 _maxSupply
    ) external eventExists(_eventId) ticketTypeExists(_eventId, _ticketTypeId) {
        require(
            events[_eventId].organizer == msg.sender,
            "Only organizer can edit ticket type"
        );
        Structs.TicketType memory ticketType = Structs.TicketType({
            id: _ticketTypeId,
            name: _ticketName,
            price: _price,
            maxSupply: _maxSupply,
            currentSupply: _maxSupply,
            tokenURI: _tokenURI,
            souvenirTokenURI: _souvenirTokenURI
        });
        events[_eventId].ticketTypes[_ticketTypeId] = ticketType;
        emit UpdateTicketType(msg.sender, _eventId, ticketType);
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
            events[_eventId].organizer == msg.sender,
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
        address _recipient,
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
        Structs.Event storage _event = events[_eventId]; // Stack too deep error workoaround
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
            _event.organizer,
            ticketType.price
        );
        require(success, "transfer failed");
        ticketType.currentSupply--;
        uint256 tokenId = _mintNFT(_recipient, ticketType.tokenURI);
        Structs.Ticket memory ticket;
        ticket.id = tokenId;
        ticket.eventId = _eventId;
        ticket.ticketTypeId = _ticketTypeId;
        ticket.owner = _recipient;
        tickets[tokenId] = ticket;
        ticketIds.push(tokenId);
        emit BuyTicket(
            msg.sender,
            _recipient,
            ticket.eventId, // Stack too deep error workoaround
            ticket.ticketTypeId, // Stack too deep error workoaround
            tokenId,
            ticketType.tokenURI,
            _event.startTime
        );
        return tokenId;
    }

    function getSouvenir(
        bytes32 _eventId,
        bytes32 _ticketTypeId,
        uint256 _ticketId,
        address _recipient
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
            _recipient,
            events[_eventId].ticketTypes[_ticketTypeId].souvenirTokenURI
        );
        ticket.souvenirMinted = true;
        ticket.souvenirId = souvenirId;
        return souvenirId;
    }

    function deposit() public payable {
        token.mint(msg.sender, msg.value);
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function becomeOrganizer() external {
        require(
            !hasRole(ORGANIZER_ROLE, msg.sender),
            "Caller is already an organizer"
        );
        require(
            token.balanceOf(msg.sender) >= organizerDeposit,
            "Not enough tokens to become organizer"
        );
        token.burn(msg.sender, organizerDeposit);
        _setupRole(ORGANIZER_ROLE, msg.sender);
        withdrawableBalance += organizerDeposit;
        // emit BecomeOrganizer(msg.sender);
    }

    // rewrite this function
    function ownerWithdraw() external {
        require(hasRole(OWNER_ROLE, msg.sender), "Caller is not an owner");
        require(withdrawableBalance > 0, "Not enough to be withdrawn");
        bool success = payable(msg.sender).send(withdrawableBalance);
        require(success, "send failed");
        emit Withdraw(msg.sender, withdrawableBalance);
        withdrawableBalance = 0;
    }

    function userWithdraw(uint256 amount) external {
        uint256 userBalance = token.balanceOf(msg.sender);
        require(amount <= userBalance, "Not enough to be withdrawn");
        require(amount <= balance, "Withdraw is currently disabled");
        bool success = payable(msg.sender).send(amount);
        require(success, "send failed");
        token.burn(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
        balance -= amount;
    }

    function transferTicket(address _recipient, uint256 _tokenId) external {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _transfer(msg.sender, _recipient, _tokenId);
        tickets[_tokenId].owner = _recipient;
        emit TransferTicket(msg.sender, _recipient, _tokenId);
    }

    function getEvent(
        bytes32 _eventId
    )
        external
        view
        eventExists(_eventId)
        returns (
            address,
            string memory,
            string memory,
            string memory,
            bytes32[] memory
        )
    {
        return (
            events[_eventId].organizer,
            events[_eventId].name,
            events[_eventId].description,
            events[_eventId].eventStorage,
            events[_eventId].ticketTypeIds
        );
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
