// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Structs {
    struct TicketType {
        bytes32 id;
        string name;
        uint256 price;
        uint256 maxSupply;
        uint256 currentSupply;
        string tokenURI;
        string souvenirTokenURI;
    }
    struct Event {
        bytes32 id;
        address organizer;
        string name;
        uint256 startTime;
        uint256 endTime;
        string description;
        string location;
        string eventStorage;
        bytes32[] ticketTypeIds;
        mapping(bytes32 => uint8) indexOf;
        mapping(bytes32 => TicketType) ticketTypes;
    }

    struct Ticket {
        uint256 id;
        bytes32 eventId;
        bytes32 ticketTypeId;
        uint256 souvenirId;
        address owner;
        bool souvenirMinted;
        bool usable;
        bool used;
    }

    struct Offer {
        bytes32 id;
        bytes32 eventId;
        bytes32 ticketTypeId;
        uint256 ticketId;
        uint256 price;
        address seller;
        address buyer;
        bool accepted;
        uint256 deadline;
        bool buyOffer;
        bool sellOffer;
    }
}
