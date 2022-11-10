// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./TIK.sol";

contract nftGenerator is AccessControl, ERC721URIStorage {
    TIK token;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    bytes32 public constant EVENT_ORGANIZER = keccak256("EVENT_ORGANIZER");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    uint256 private balance = 0;

    constructor() ERC721("MyNFT", "NFT") {
        _grantRole(OWNER_ROLE, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getMetadata(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function _mintNFT(address recipient, string memory tokenURI)
        private
        returns (uint256)
    {
        require(
            hasRole(MINTER_ROLE, msg.sender) || hasRole(OWNER_ROLE, msg.sender)
        );
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function buyTicket(
        string memory tokenURI,
        address recepient,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 ticketPrice
    ) external returns (uint256) {
        token.permit(msg.sender, address(this), value, deadline, v, r, s);
        require(
            token.allowance(msg.sender, address(this)) >= ticketPrice,
            "Token allowance too low"
        );
        bool success = token.transferFrom(
            msg.sender,
            address(this),
            ticketPrice
        );
        require(success, "transfer failed");
        return _mintNFT(recepient, tokenURI);
    }

    function deposit() public payable {
        token.mint(msg.sender, msg.value);
        // emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external {
        require(hasRole(OWNER_ROLE, msg.sender));
        require(balance > 0, "No fees to be withdrawn");
        bool success = payable(msg.sender).send(balance);
        require(success, "send failed");
        token.burn(address(this), balance);
        balance = 0;
    }
}
