// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract nftGenerator is AccessControl, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    bytes32 public constant EVENT_ORGANIZER = keccak256("EVENT_ORGANIZER");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

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

    function mintNFT(address recipient, string memory tokenURI)
        public
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
}
