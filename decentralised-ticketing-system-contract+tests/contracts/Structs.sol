// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Structs {
    struct TicketType {
        bytes32 id;
        uint256 price;
        uint256 maxSupply;
        uint256 currentSupply;
        string tokenURI;
        string souvenirTokenURI;
    }
    struct Event {
        bytes32 id;
        mapping(address => bool) organizers;
        bytes32[] ticketTypeIds;
        mapping(bytes32 => TicketType) ticketTypes;
    }

    struct Ticket {
        uint256 id;
        bytes32 eventId;
        bytes32 ticketTypeId;
        uint256 souvenirId;
        address owner;
        bool souvenirMinted;
    }
}
