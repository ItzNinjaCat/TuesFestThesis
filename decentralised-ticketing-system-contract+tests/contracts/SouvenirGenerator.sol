// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import './TIK.sol';

contract SouvenirGenerator is Ownable, ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  uint256 private balance = 0;
  address private ticketContractAddress;

  modifier isTicketContract() {
    require(
      msg.sender == ticketContractAddress,
      'SouvenirGenerator: Only Ticket contract can call this function'
    );
    _;
  }

  constructor() ERC721('Souvenir NFT', 'NFT') {}

  function setTicketContractAddress(address _ticketContractAddress) external onlyOwner {
    ticketContractAddress = _ticketContractAddress;
  }

  function generateSouvenir(
    address recipient,
    string memory tokenURI
  ) external isTicketContract returns (uint256) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _mint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);
    return newItemId;
  }

  function transferFrom(address, address, uint256) public pure override {
    revert("You can't transfer souvenirs");
  }
}
