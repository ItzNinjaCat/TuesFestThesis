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
        string location,
        uint256 startTime,
        uint256 endTime
    );

    event UpdateEvent(
        address indexed creator,
        bytes32 eventId,
        string name,
        string description,
        string eventStorage,
        string location,
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

    event DeleteTicketType(
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

    event GenerateSouvenir(
        address indexed owner,
        Structs.Ticket ticket,
        uint256 tokenId,
        string tokenURI
    );

    event TransferTicket(
        address indexed sender,
        address indexed receiver,
        uint256 tokenId
    );

    event CreateBuyOffer(
        bytes32 offerId,
        address indexed buyer,
        bytes32 eventId,
        bytes32 ticketTypeId,
        uint256 price,
        uint256 deadline
    );

    event AcceptBuyOffer(
        bytes32 indexed offerId,
        address indexed buyer,
        address indexed seller,
        bytes32 eventId,
        bytes32 ticketTypeId,
        uint256 ticketId,
        string tokenURI,
        uint256 price
    );

    event CreateSellOffer(
        bytes32 indexed offerId,
        address indexed seller,
        bytes32 eventId,
        bytes32 ticketTypeId,
        uint256 ticketId,
        uint256 price
    );

    event AcceptSellOffer(
        bytes32 indexed offerId,
        address indexed buyer,
        address indexed seller,
        bytes32 eventId,
        bytes32 ticketTypeId,
        uint256 ticketId,
        string tokenURI,
        uint256 price
    );

    event CancelOffer(bytes32 indexed offerId, address indexed sender);

    event UseTicket(address indexed sender, uint256 ticketId);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    SouvenirGenerator private souvenirGenerator;
    TIK private token;

    bytes32[] private eventIds;
    mapping(bytes32 => Structs.Event) private events;

    uint256[] private ticketIds;
    mapping(uint256 => Structs.Ticket) private tickets;
    mapping(bytes32 => Structs.Offer) private offers;

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

    modifier onlyTicketOwner(uint256 _tokenId) {
        require(
            ownerOf(_tokenId) == msg.sender,
            "Only ticket owner can call this function"
        );
        _;
    }

    modifier offerExists(bytes32 _offerId) {
        require(offers[_offerId].id != 0, "Offer does not exist");
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
        string memory location,
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
        events[_eventId].location = location;
        events[_eventId].startTime = startTime;
        events[_eventId].endTime = endTime;
        emit CreateEvent(
            msg.sender,
            _eventId,
            _name,
            _description,
            eventStorage,
            location,
            startTime,
            endTime
        );
    }

    function updateEvent(
        bytes32 _eventId,
        string memory _name,
        string memory _description,
        string memory eventStorage,
        string memory location,
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
        events[_eventId].location = location;
        events[_eventId].startTime = startTime;
        events[_eventId].endTime = endTime;
        emit UpdateEvent(
            msg.sender,
            _eventId,
            _name,
            _description,
            eventStorage,
            location,
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
        events[_eventId].indexOf[_ticketTypeId] = uint8(
            events[_eventId].ticketTypeIds.length
        );
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

    function deleteTicketType(
        bytes32 _eventId,
        bytes32 _ticketTypeId
    )
        external
        eventExists(_eventId)
        ticketTypeExists(_eventId, _ticketTypeId)
        onlyOrganizer
    {
        Structs.Event storage _event = events[_eventId];
        require(
            _event.organizer == msg.sender,
            "Only organizer can remove ticket type"
        );
        delete _event.ticketTypes[_ticketTypeId];

        uint8 index = _event.indexOf[_ticketTypeId];
        uint8 lastIndex = uint8(_event.ticketTypeIds.length) - 1;
        bytes32 lastKey = _event.ticketTypeIds[lastIndex];

        _event.indexOf[lastKey] = index;
        delete _event.indexOf[_ticketTypeId];

        _event.ticketTypeIds[index] = lastKey;
        _event.ticketTypeIds.pop();
        emit DeleteTicketType(msg.sender, _eventId, _ticketTypeId);
    }

    function _mintNFT(
        address _recipient,
        string memory _tokenURI
    ) private returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        return newItemId;
    }

    function ticketPurchasePermit(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        token.permit(msg.sender, address(this), amount, deadline, v, r, s);
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
        if (deadline != 0) {
            token.permit(
                msg.sender,
                address(this),
                ticketType.price,
                deadline,
                v,
                r,
                s
            );
        }
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
        ticket.usable = true;
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
        uint256 _ticketId
    )
        external
        ticketExists(_ticketId)
        onlyTicketOwner(_ticketId)
        returns (uint256)
    {
        Structs.Ticket memory ticket = tickets[_ticketId];
        require(!ticket.souvenirMinted, "Souvenir already minted");
        require(!ticket.usable, "Ticket still hasn't been used");
        uint256 souvenirId = souvenirGenerator.generateSouvenir(
            msg.sender,
            events[ticket.eventId]
                .ticketTypes[ticket.ticketTypeId]
                .souvenirTokenURI
        );
        ticket.souvenirMinted = true;
        ticket.souvenirId = souvenirId;
        tickets[_ticketId] = ticket;
        emit GenerateSouvenir(
            msg.sender,
            tickets[_ticketId],
            souvenirId,
            events[ticket.eventId]
                .ticketTypes[ticket.ticketTypeId]
                .souvenirTokenURI
        );
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

    function transferTicket(
        address _sender,
        address _recipient,
        uint256 _tokenId
    ) private {
        _transfer(_sender, _recipient, _tokenId);
        tickets[_tokenId].owner = _recipient;
        emit TransferTicket(_sender, _recipient, _tokenId);
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
            uint256,
            uint256,
            bytes32[] memory
        )
    {
        Structs.Event storage e = events[_eventId];
        return (
            e.organizer,
            e.name,
            e.description,
            e.eventStorage,
            e.startTime,
            e.endTime,
            e.ticketTypeIds
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

    function createBuyOffer(
        bytes32 id,
        bytes32 eventId,
        bytes32 ticketTypeId,
        uint256 price,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        token.permit(msg.sender, address(this), price, deadline, v, r, s);
        Structs.Offer memory offer;
        offer.id = id;
        offer.buyer = msg.sender;
        offer.eventId = eventId;
        offer.ticketTypeId = ticketTypeId;
        offer.price = price;
        offer.deadline = deadline;
        offer.buyOffer = true;
        offer.sellOffer = false;
        offers[id] = offer;
        emit CreateBuyOffer(
            id,
            msg.sender,
            eventId,
            ticketTypeId,
            price,
            deadline
        );
    }

    function acceptBuyOffer(bytes32 id, uint256 ticketId) external {
        Structs.Offer storage offer = offers[id];
        require(offer.buyer != msg.sender, "Cannot buy your own ticket");
        require(
            token.allowance(offer.buyer, address(this)) >= offer.price,
            "Token allowance too low"
        );
        offer.ticketId = ticketId;
        bool success = token.transferFrom(offer.buyer, msg.sender, offer.price);
        require(success, "transfer failed");
        transferTicket(msg.sender, offer.buyer, offer.ticketId);
        offer.accepted = true;
        offer.seller = msg.sender;
        tickets[offer.ticketId].owner = offer.buyer;
        tickets[offer.ticketId].usable = true;
        emit AcceptBuyOffer(
            id,
            offer.buyer,
            msg.sender,
            offer.eventId,
            offer.ticketTypeId,
            offer.ticketId,
            events[offer.eventId].ticketTypes[offer.ticketTypeId].tokenURI,
            offer.price
        );
        delete offers[id];
    }

    function createSellOffer(
        bytes32 id,
        bytes32 eventId,
        bytes32 ticketTypeId,
        uint256 ticketId,
        uint256 price
    ) external onlyTicketOwner(ticketId) {
        Structs.Offer memory offer;
        offer.id = id;
        offer.seller = msg.sender;
        offer.eventId = eventId;
        offer.ticketTypeId = ticketTypeId;
        offer.ticketId = ticketId;
        offer.price = price;
        offer.deadline = 0;
        offer.buyOffer = false;
        offer.sellOffer = true;
        offers[id] = offer;
        tickets[ticketId].usable = false;
        emit CreateSellOffer(
            id,
            msg.sender,
            eventId,
            ticketTypeId,
            ticketId,
            price
        );
    }

    function acceptSellOffer(
        bytes32 id,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        Structs.Offer storage offer = offers[id];
        require(offer.seller != msg.sender, "Cannot buy your own ticket");
        token.permit(msg.sender, address(this), offer.price, deadline, v, r, s);

        require(
            token.allowance(msg.sender, address(this)) >= offer.price,
            "Token allowance too low"
        );
        bool success = token.transferFrom(
            msg.sender,
            offer.seller,
            offer.price
        );
        require(success, "transfer failed");
        transferTicket(offer.seller, msg.sender, offer.ticketId);
        offer.accepted = true;
        offer.buyer = msg.sender;
        tickets[offer.ticketId].usable = true;
        tickets[offer.ticketId].owner = offer.buyer;
        emit AcceptSellOffer(
            id,
            offer.seller,
            msg.sender,
            offer.eventId,
            offer.ticketTypeId,
            offer.ticketId,
            events[offer.eventId].ticketTypes[offer.ticketTypeId].tokenURI,
            offer.price
        );
        delete offers[id];
    }

    function cancelOffer(bytes32 id) external {
        Structs.Offer storage offer = offers[id];
        require(
            (offer.buyer == msg.sender && offer.buyOffer == true) ||
                (offer.seller == msg.sender && offer.buyOffer == true),
            "Not the buyer or seller"
        );
        require(!offer.accepted, "Offer already accepted");
        tickets[offers[id].ticketId].usable = true;
        delete offers[id];
        emit CancelOffer(id, msg.sender);
    }

    function getOffer(
        bytes32 id
    ) external view offerExists(id) returns (Structs.Offer memory) {
        return offers[id];
    }

    function useTicket(uint256 _ticketId) external onlyOrganizer {
        require(tickets[_ticketId].usable, "Ticket not usable");
        require(
            events[tickets[_ticketId].eventId].organizer == msg.sender,
            "Not the organizer"
        );
        if (events[tickets[_ticketId].eventId].endTime != 0) {
            require(
                block.timestamp < events[tickets[_ticketId].eventId].endTime,
                "Event has ended"
            );
        }
        require(
            block.timestamp >= events[tickets[_ticketId].eventId].startTime,
            "Event has not started"
        );
        tickets[_ticketId].usable = false;
        emit UseTicket(msg.sender, _ticketId);
    }
}
