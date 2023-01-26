// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./TIK.sol";

contract SouvenirGenerator is Ownable, ERC721URIStorage {
    event GenerateSouvenir(
        address indexed creator,
        address indexed recipient,
        uint256 tokenId,
        string tokenURI
    );

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 private balance = 0;
    address private ticketContractAddress;

    modifier isTicketContract() {
        require(
            msg.sender == ticketContractAddress,
            "SouvenirGenerator: Only Ticket contract can call this function"
        );
        _;
    }

    constructor() ERC721("Souvenir NFT", "NFT") {}

    function setTicketContractAddress(
        address _ticketContractAddress
    ) external onlyOwner {
        ticketContractAddress = _ticketContractAddress;
    }

    function getSouvenirMetadata(
        uint256 tokenId
    ) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function _mintNFT(
        address recipient,
        string memory tokenURI
    ) private returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        emit GenerateSouvenir(msg.sender, recipient, newItemId, tokenURI);
        return newItemId;
    }

    function generateSouvenir(
        address recipient,
        string memory tokenURI
    ) external isTicketContract returns (uint256) {
        return _mintNFT(recipient, tokenURI);
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert("You can't transfer souvenirs");
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert("You can't transfer souvenirs");
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("You can't transfer souvenirs");
    }
}
