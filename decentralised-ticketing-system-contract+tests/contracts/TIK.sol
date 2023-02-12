// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract TIK is ERC20, Ownable {
  bytes32 public DOMAIN_SEPARATOR;
  bytes32 public constant PERMIT_TYPEHASH =
    0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
  mapping(address => uint256) public nonces;
  address private ticketContractAddress;
  modifier isTicketContract() {
    require(
      msg.sender == ticketContractAddress,
      'TIK: Only Ticket contract can call this function'
    );
    _;
  }

  constructor() ERC20('Ticket Token', 'TIK') {
    DOMAIN_SEPARATOR = keccak256(
      abi.encode(
        keccak256('EIP712Domain(string name,string version,address verifyingContract)'),
        keccak256(bytes('Ticket Token')),
        keccak256(bytes('1')),
        address(this)
      )
    );
  }

  function setTicketContractAddress(address _ticketContractAddress) external onlyOwner {
    ticketContractAddress = _ticketContractAddress;
  }

  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external isTicketContract {
    require(deadline >= block.timestamp, 'ERC20WithPermit: EXPIRED');

    bytes32 digest = keccak256(
      abi.encodePacked(
        '\x19\x01',
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
      )
    );

    address recoveredAddress = ecrecover(digest, v, r, s);
    require(
      recoveredAddress != address(0) && recoveredAddress == owner,
      'ERC20WithPermit: INVALID_SIGNATURE'
    );

    _approve(owner, spender, value);
  }

  function mint(address account, uint256 amount) external isTicketContract {
    _mint(account, amount);
  }

  function burn(address account, uint256 amount) external isTicketContract {
    _burn(account, amount);
  }
}
