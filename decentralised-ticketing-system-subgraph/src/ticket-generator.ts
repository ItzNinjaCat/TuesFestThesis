import {
  AcceptBuyOffer as AcceptBuyOfferEvent,
  AcceptSellOffer as AcceptSellOfferEvent,
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  BuyTicket as BuyTicketEvent,
  CancelOffer as CancelOfferEvent,
  CreateBuyOffer as CreateBuyOfferEvent,
  CreateEvent as CreateEventEvent,
  CreateSellOffer as CreateSellOfferEvent,
  CreateTicketType as CreateTicketTypeEvent,
  DeleteEvent as DeleteEventEvent,
  DeleteTickeyType as DeleteTickeyTypeEvent,
  Deposit as DepositEvent,
  GenerateTicket as GenerateTicketEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Transfer as TransferEvent,
  TransferTicket as TransferTicketEvent,
  UpdateEvent as UpdateEventEvent,
  UpdateTicketType as UpdateTicketTypeEvent,
  Withdraw as WithdrawEvent
} from "../generated/TicketGenerator/TicketGenerator"
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
} from "../generated/schema"

export function handleAcceptBuyOffer(event: AcceptBuyOfferEvent): void {
  let entity = new AcceptBuyOffer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.offerId = event.params.offerId
  entity.buyer = event.params.buyer
  entity.seller = event.params.seller
  entity.eventId = event.params.eventId
  entity.ticketTypeId = event.params.ticketTypeId
  entity.ticketId = event.params.ticketId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAcceptSellOffer(event: AcceptSellOfferEvent): void {
  let entity = new AcceptSellOffer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.offerId = event.params.offerId
  entity.buyer = event.params.buyer
  entity.seller = event.params.seller
  entity.eventId = event.params.eventId
  entity.ticketTypeId = event.params.ticketTypeId
  entity.ticketId = event.params.ticketId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBuyTicket(event: BuyTicketEvent): void {
  let entity = new BuyTicket(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.buyer = event.params.buyer
  entity.owner = event.params.owner
  entity.eventId = event.params.eventId
  entity.ticketTypeId = event.params.ticketTypeId
  entity.tokenId = event.params.tokenId
  entity.tokenURI = event.params.tokenURI
  entity.eventStartTime = event.params.eventStartTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCancelOffer(event: CancelOfferEvent): void {
  let entity = new CancelOffer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.offerId = event.params.offerId
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreateBuyOffer(event: CreateBuyOfferEvent): void {
  let entity = new CreateBuyOffer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.offerId = event.params.offerId
  entity.buyer = event.params.buyer
  entity.eventId = event.params.eventId
  entity.ticketTypeId = event.params.ticketTypeId
  entity.price = event.params.price
  entity.deadline = event.params.deadline

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreateEvent(event: CreateEventEvent): void {
  let entity = new CreateEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.eventId = event.params.eventId
  entity.name = event.params.name
  entity.description = event.params.description
  entity.eventStorage = event.params.eventStorage
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreateSellOffer(event: CreateSellOfferEvent): void {
  let entity = new CreateSellOffer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.offerId = event.params.offerId
  entity.seller = event.params.seller
  entity.eventId = event.params.eventId
  entity.ticketTypeId = event.params.ticketTypeId
  entity.ticketId = event.params.ticketId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreateTicketType(event: CreateTicketTypeEvent): void {
  let entity = new CreateTicketType(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.eventId = event.params.eventId
  entity.ticketType_id = event.params.ticketType.id
  entity.ticketType_name = event.params.ticketType.name
  entity.ticketType_price = event.params.ticketType.price
  entity.ticketType_maxSupply = event.params.ticketType.maxSupply
  entity.ticketType_currentSupply = event.params.ticketType.currentSupply
  entity.ticketType_tokenURI = event.params.ticketType.tokenURI
  entity.ticketType_souvenirTokenURI = event.params.ticketType.souvenirTokenURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeleteEvent(event: DeleteEventEvent): void {
  let entity = new DeleteEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.eventId = event.params.eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeleteTickeyType(event: DeleteTickeyTypeEvent): void {
  let entity = new DeleteTickeyType(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.eventId = event.params.eventId
  entity.ticketTypeId = event.params.ticketTypeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGenerateTicket(event: GenerateTicketEvent): void {
  let entity = new GenerateTicket(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.receiver = event.params.receiver
  entity.tokenId = event.params.tokenId
  entity.tokenURI = event.params.tokenURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferTicket(event: TransferTicketEvent): void {
  let entity = new TransferTicket(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.receiver = event.params.receiver
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpdateEvent(event: UpdateEventEvent): void {
  let entity = new UpdateEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.eventId = event.params.eventId
  entity.name = event.params.name
  entity.description = event.params.description
  entity.eventStorage = event.params.eventStorage
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpdateTicketType(event: UpdateTicketTypeEvent): void {
  let entity = new UpdateTicketType(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.eventId = event.params.eventId
  entity.ticketType_id = event.params.ticketType.id
  entity.ticketType_name = event.params.ticketType.name
  entity.ticketType_price = event.params.ticketType.price
  entity.ticketType_maxSupply = event.params.ticketType.maxSupply
  entity.ticketType_currentSupply = event.params.ticketType.currentSupply
  entity.ticketType_tokenURI = event.params.ticketType.tokenURI
  entity.ticketType_souvenirTokenURI = event.params.ticketType.souvenirTokenURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  let entity = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.receiver = event.params.receiver
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
