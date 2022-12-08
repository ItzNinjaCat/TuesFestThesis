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
        address indexed receiver,
        uint256 tokenId,
        string tokenURI
    );
    event TransferSouvenir(
        address indexed sender,
        address indexed receiver,
        uint256 tokenId
    );

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant EVENT_ORGANIZER = keccak256("EVENT_ORGANIZER");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
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

    // function supportsInterface(
    //     bytes4 interfaceId
    // ) public view virtual override(ERC721, Ownable) returns (bool) {
    //     return super.supportsInterface(interfaceId);
    // }

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

    function transferSouvenir(address _receiver, uint256 _tokenId) external {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _transfer(msg.sender, _receiver, _tokenId);
        emit TransferSouvenir(msg.sender, _receiver, _tokenId);
    }
}
