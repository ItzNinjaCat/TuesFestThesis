import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  AcceptBuyOffer,
  AcceptSellOffer,
  Approval,
  ApprovalForAll,
  BuyTicket,
  CancelOffer,
  CreateBuyOffer,
  CreateEvent,
  CreateSellOffer,
  CreateTicketType,
  DeleteEvent,
  DeleteTickeyType,
  Deposit,
  GenerateTicket,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
  TransferTicket,
  UpdateEvent,
  UpdateTicketType,
  Withdraw
} from "../generated/TicketGenerator/TicketGenerator"

export function createAcceptBuyOfferEvent(
  offerId: Bytes,
  buyer: Address,
  seller: Address,
  eventId: Bytes,
  ticketTypeId: Bytes,
  ticketId: BigInt,
  price: BigInt
): AcceptBuyOffer {
  let acceptBuyOfferEvent = changetype<AcceptBuyOffer>(newMockEvent())

  acceptBuyOfferEvent.parameters = new Array()

  acceptBuyOfferEvent.parameters.push(
    new ethereum.EventParam("offerId", ethereum.Value.fromFixedBytes(offerId))
  )
  acceptBuyOfferEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  acceptBuyOfferEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  acceptBuyOfferEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  acceptBuyOfferEvent.parameters.push(
    new ethereum.EventParam(
      "ticketTypeId",
      ethereum.Value.fromFixedBytes(ticketTypeId)
    )
  )
  acceptBuyOfferEvent.parameters.push(
    new ethereum.EventParam(
      "ticketId",
      ethereum.Value.fromUnsignedBigInt(ticketId)
    )
  )
  acceptBuyOfferEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return acceptBuyOfferEvent
}

export function createAcceptSellOfferEvent(
  offerId: Bytes,
  buyer: Address,
  seller: Address,
  eventId: Bytes,
  ticketTypeId: Bytes,
  ticketId: BigInt,
  price: BigInt
): AcceptSellOffer {
  let acceptSellOfferEvent = changetype<AcceptSellOffer>(newMockEvent())

  acceptSellOfferEvent.parameters = new Array()

  acceptSellOfferEvent.parameters.push(
    new ethereum.EventParam("offerId", ethereum.Value.fromFixedBytes(offerId))
  )
  acceptSellOfferEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  acceptSellOfferEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  acceptSellOfferEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  acceptSellOfferEvent.parameters.push(
    new ethereum.EventParam(
      "ticketTypeId",
      ethereum.Value.fromFixedBytes(ticketTypeId)
    )
  )
  acceptSellOfferEvent.parameters.push(
    new ethereum.EventParam(
      "ticketId",
      ethereum.Value.fromUnsignedBigInt(ticketId)
    )
  )
  acceptSellOfferEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return acceptSellOfferEvent
}

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createBuyTicketEvent(
  buyer: Address,
  owner: Address,
  eventId: Bytes,
  ticketTypeId: Bytes,
  tokenId: BigInt,
  tokenURI: string,
  eventStartTime: BigInt
): BuyTicket {
  let buyTicketEvent = changetype<BuyTicket>(newMockEvent())

  buyTicketEvent.parameters = new Array()

  buyTicketEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  buyTicketEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  buyTicketEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  buyTicketEvent.parameters.push(
    new ethereum.EventParam(
      "ticketTypeId",
      ethereum.Value.fromFixedBytes(ticketTypeId)
    )
  )
  buyTicketEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  buyTicketEvent.parameters.push(
    new ethereum.EventParam("tokenURI", ethereum.Value.fromString(tokenURI))
  )
  buyTicketEvent.parameters.push(
    new ethereum.EventParam(
      "eventStartTime",
      ethereum.Value.fromUnsignedBigInt(eventStartTime)
    )
  )

  return buyTicketEvent
}

export function createCancelOfferEvent(
  offerId: Bytes,
  sender: Address
): CancelOffer {
  let cancelOfferEvent = changetype<CancelOffer>(newMockEvent())

  cancelOfferEvent.parameters = new Array()

  cancelOfferEvent.parameters.push(
    new ethereum.EventParam("offerId", ethereum.Value.fromFixedBytes(offerId))
  )
  cancelOfferEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return cancelOfferEvent
}

export function createCreateBuyOfferEvent(
  offerId: Bytes,
  buyer: Address,
  eventId: Bytes,
  ticketTypeId: Bytes,
  price: BigInt,
  deadline: BigInt
): CreateBuyOffer {
  let createBuyOfferEvent = changetype<CreateBuyOffer>(newMockEvent())

  createBuyOfferEvent.parameters = new Array()

  createBuyOfferEvent.parameters.push(
    new ethereum.EventParam("offerId", ethereum.Value.fromFixedBytes(offerId))
  )
  createBuyOfferEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  createBuyOfferEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  createBuyOfferEvent.parameters.push(
    new ethereum.EventParam(
      "ticketTypeId",
      ethereum.Value.fromFixedBytes(ticketTypeId)
    )
  )
  createBuyOfferEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  createBuyOfferEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )

  return createBuyOfferEvent
}

export function createCreateEventEvent(
  creator: Address,
  eventId: Bytes,
  name: string,
  description: string,
  eventStorage: string,
  startTime: BigInt,
  endTime: BigInt
): CreateEvent {
  let createEventEvent = changetype<CreateEvent>(newMockEvent())

  createEventEvent.parameters = new Array()

  createEventEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  createEventEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  createEventEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  createEventEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )
  createEventEvent.parameters.push(
    new ethereum.EventParam(
      "eventStorage",
      ethereum.Value.fromString(eventStorage)
    )
  )
  createEventEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )
  createEventEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )

  return createEventEvent
}

export function createCreateSellOfferEvent(
  offerId: Bytes,
  seller: Address,
  eventId: Bytes,
  ticketTypeId: Bytes,
  ticketId: BigInt,
  price: BigInt
): CreateSellOffer {
  let createSellOfferEvent = changetype<CreateSellOffer>(newMockEvent())

  createSellOfferEvent.parameters = new Array()

  createSellOfferEvent.parameters.push(
    new ethereum.EventParam("offerId", ethereum.Value.fromFixedBytes(offerId))
  )
  createSellOfferEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  createSellOfferEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  createSellOfferEvent.parameters.push(
    new ethereum.EventParam(
      "ticketTypeId",
      ethereum.Value.fromFixedBytes(ticketTypeId)
    )
  )
  createSellOfferEvent.parameters.push(
    new ethereum.EventParam(
      "ticketId",
      ethereum.Value.fromUnsignedBigInt(ticketId)
    )
  )
  createSellOfferEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return createSellOfferEvent
}

export function createCreateTicketTypeEvent(
  creator: Address,
  eventId: Bytes,
  ticketType: ethereum.Tuple
): CreateTicketType {
  let createTicketTypeEvent = changetype<CreateTicketType>(newMockEvent())

  createTicketTypeEvent.parameters = new Array()

  createTicketTypeEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  createTicketTypeEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  createTicketTypeEvent.parameters.push(
    new ethereum.EventParam("ticketType", ethereum.Value.fromTuple(ticketType))
  )

  return createTicketTypeEvent
}

export function createDeleteEventEvent(
  creator: Address,
  eventId: Bytes
): DeleteEvent {
  let deleteEventEvent = changetype<DeleteEvent>(newMockEvent())

  deleteEventEvent.parameters = new Array()

  deleteEventEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  deleteEventEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )

  return deleteEventEvent
}

export function createDeleteTickeyTypeEvent(
  creator: Address,
  eventId: Bytes,
  ticketTypeId: Bytes
): DeleteTickeyType {
  let deleteTickeyTypeEvent = changetype<DeleteTickeyType>(newMockEvent())

  deleteTickeyTypeEvent.parameters = new Array()

  deleteTickeyTypeEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  deleteTickeyTypeEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  deleteTickeyTypeEvent.parameters.push(
    new ethereum.EventParam(
      "ticketTypeId",
      ethereum.Value.fromFixedBytes(ticketTypeId)
    )
  )

  return deleteTickeyTypeEvent
}

export function createDepositEvent(sender: Address, amount: BigInt): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return depositEvent
}

export function createGenerateTicketEvent(
  creator: Address,
  receiver: Address,
  tokenId: BigInt,
  tokenURI: string
): GenerateTicket {
  let generateTicketEvent = changetype<GenerateTicket>(newMockEvent())

  generateTicketEvent.parameters = new Array()

  generateTicketEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  generateTicketEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  generateTicketEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  generateTicketEvent.parameters.push(
    new ethereum.EventParam("tokenURI", ethereum.Value.fromString(tokenURI))
  )

  return generateTicketEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createTransferTicketEvent(
  sender: Address,
  receiver: Address,
  tokenId: BigInt
): TransferTicket {
  let transferTicketEvent = changetype<TransferTicket>(newMockEvent())

  transferTicketEvent.parameters = new Array()

  transferTicketEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  transferTicketEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  transferTicketEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferTicketEvent
}

export function createUpdateEventEvent(
  creator: Address,
  eventId: Bytes,
  name: string,
  description: string,
  eventStorage: string,
  startTime: BigInt,
  endTime: BigInt
): UpdateEvent {
  let updateEventEvent = changetype<UpdateEvent>(newMockEvent())

  updateEventEvent.parameters = new Array()

  updateEventEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  updateEventEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  updateEventEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  updateEventEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )
  updateEventEvent.parameters.push(
    new ethereum.EventParam(
      "eventStorage",
      ethereum.Value.fromString(eventStorage)
    )
  )
  updateEventEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )
  updateEventEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )

  return updateEventEvent
}

export function createUpdateTicketTypeEvent(
  creator: Address,
  eventId: Bytes,
  ticketType: ethereum.Tuple
): UpdateTicketType {
  let updateTicketTypeEvent = changetype<UpdateTicketType>(newMockEvent())

  updateTicketTypeEvent.parameters = new Array()

  updateTicketTypeEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  updateTicketTypeEvent.parameters.push(
    new ethereum.EventParam("eventId", ethereum.Value.fromFixedBytes(eventId))
  )
  updateTicketTypeEvent.parameters.push(
    new ethereum.EventParam("ticketType", ethereum.Value.fromTuple(ticketType))
  )

  return updateTicketTypeEvent
}

export function createWithdrawEvent(
  receiver: Address,
  amount: BigInt
): Withdraw {
  let withdrawEvent = changetype<Withdraw>(newMockEvent())

  withdrawEvent.parameters = new Array()

  withdrawEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawEvent
}
