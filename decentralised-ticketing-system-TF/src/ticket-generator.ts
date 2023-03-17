import { BigInt } from "@graphprotocol/graph-ts"
import {
  TicketGenerator,
  AcceptBuyOffer,
  AcceptSellOffer,
  Approval,
  ApprovalForAll,
  BecomeOrganizer,
  BuyTicket,
  CancelOffer,
  CreateBuyOffer,
  CreateEvent,
  CreateSellOffer,
  CreateTicketType,
  DeleteEvent,
  DeleteTicketType,
  Deposit,
  GenerateSouvenir,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
  TransferTicket,
  UpdateEvent,
  UpdateTicketType,
  UseTicket,
  Withdraw
} from "../generated/TicketGenerator/TicketGenerator"
import { Event, Ticket, TicketType, Souvenir, Offer, Organizer } from "../generated/schema"

export function handleCreateEvent(event: CreateEvent): void {
  let entity = new Event(event.params.eventId.toHex());
  entity.creator = event.params.creator;
  entity.name = event.params.name;
  entity.description = event.params.description;
  entity.eventStorage = event.params.eventStorage;
  entity.location = event.params.location;
  entity.startTime = event.params.startTime;
  entity.endTime = event.params.endTime;
  entity.category = event.params.category;
  entity.subcategory = event.params.subCategory;
  entity.createdAt = event.block.timestamp;
  entity.deleted = false;
  entity.save();
}

export function handleUpdateEvent(event: UpdateEvent): void {
  let entity = Event.load(event.params.eventId.toHex());
  if (entity !== null) {
    entity.creator = event.params.creator;
    entity.name = event.params.name;
    entity.description = event.params.description;
    entity.eventStorage = event.params.eventStorage;
    entity.location = event.params.location;
    entity.startTime = event.params.startTime;
    entity.endTime = event.params.endTime;
    entity.updatedAt = event.block.timestamp;
    entity.save();
  }
}

export function handleDeleteEvent(event: DeleteEvent): void {
  let entity = Event.load(event.params.eventId.toHex());
  if (entity !== null) {
    entity.deleted = true;
    entity.save();
  }
}

export function handleCreateTicketType(event: CreateTicketType): void {
  let entity = new TicketType(event.params.ticketType.id.toHex());
  entity.name = event.params.ticketType.name;
  entity.price = event.params.ticketType.price;
  entity.maxSupply = event.params.ticketType.maxSupply;
  entity.currentSupply = event.params.ticketType.currentSupply;
  entity.tokenURI = event.params.ticketType.tokenURI;
  entity.souvenirTokenURI = event.params.ticketType.souvenirTokenURI;
  entity.event = event.params.eventId.toHex();
  entity.deleted = false;
  entity.save();
}
export function handleDeleteTicketType(event: DeleteTicketType): void {
  let entity = TicketType.load(event.params.ticketTypeId.toHex());
  if (entity !== null) {
    entity.deleted = true;
    entity.save();
  }
}
export function handleUpdateTicketType(event: UpdateTicketType): void {
  let entity = TicketType.load(event.params.ticketType.id.toHex());
  if (entity !== null) {
    entity.name = event.params.ticketType.name;
    entity.price = event.params.ticketType.price;
    entity.maxSupply = event.params.ticketType.maxSupply;
    entity.currentSupply = event.params.ticketType.currentSupply;
    entity.tokenURI = event.params.ticketType.tokenURI;
    entity.souvenirTokenURI = event.params.ticketType.souvenirTokenURI;
    entity.save();
  }
}
export function handleCreateBuyOffer(event: CreateBuyOffer): void {
  let entity = new Offer(event.params.offerId.toHex());
  entity.buyer = event.params.buyer;
  entity.event = event.params.eventId.toHex();
  entity.ticketType = event.params.ticketTypeId.toHex();
  entity.price = event.params.price;
  entity.buyOffer = true;
  entity.sellOffer = false;
  entity.deadline = event.params.deadline;
  entity.deleted = false;
  entity.save();
}
export function handleAcceptBuyOffer(event: AcceptBuyOffer): void {
  let entity = Offer.load(event.params.offerId.toHex());
  if (entity !== null) {
    entity.seller = event.params.seller;
    entity.ticket = event.params.ticketId.toHex();
    entity.deleted = true;
    entity.save();
  }
}
export function handleCreateSellOffer(event: CreateSellOffer): void {
  let entity = new Offer(event.params.offerId.toHex());
  entity.seller = event.params.seller;
  entity.event = event.params.eventId.toHex();
  entity.ticketType = event.params.ticketTypeId.toHex();
  entity.ticket = event.params.ticketId.toHex();
  entity.price = event.params.price;
  entity.buyOffer = false;
  entity.sellOffer = true;
  entity.deleted = false;
  entity.save();
  let ticket = Ticket.load(event.params.ticketId.toHex());
  if (ticket !== null) {
    ticket.usable = false;
    ticket.save();
  }
}
export function handleAcceptSellOffer(event: AcceptSellOffer): void {
  let entity = Offer.load(event.params.offerId.toHex());
  if (entity !== null) {
    entity.deleted = true;
    entity.buyer = event.params.buyer;
    entity.save();
    let ticket = Ticket.load(event.params.ticketId.toHex());
    if (ticket !== null) {
      ticket.usable = true;
      ticket.save();
    }
  }
}
export function handleCancelOffer(event: CancelOffer): void {
  let entity = Offer.load(event.params.offerId.toHex());
  if (entity !== null) {
    entity.deleted = true;
    entity.save();
    if (entity.sellOffer) {
      let ticket = Ticket.load(entity.ticket!);
      if (ticket !== null) {
        ticket.usable = true;
        ticket.save();
      }
    }
  }

}

export function handleBuyTicket(event: BuyTicket): void {
  let entity = new Ticket(event.params.tokenId.toHex());
  entity.event = event.params.eventId.toHex();
  entity.ticketType = event.params.ticketTypeId.toHex();
  entity.creator = event.params.buyer;
  entity.owner = event.params.owner;
  entity.deleted = false;
  entity.souvenirMinted = false;
  entity.usable = true;
  entity.used = false;
  entity.tokenId = event.params.tokenId;
  entity.tokenURI = event.params.tokenURI;
  entity.timestamp = event.block.timestamp;
  entity.save();
  let ticketType = TicketType.load(entity.ticketType);
  if (ticketType !== null) {
    ticketType.currentSupply = ticketType.currentSupply.minus(BigInt.fromI32(1));
    ticketType.save();
  }
}
export function handleTransferTicket(event: TransferTicket): void {
  let entity = Ticket.load(event.params.tokenId.toHex());
  if (entity !== null) {
    entity.owner = event.params.receiver;
    entity.save();
  }
}
export function handleUseTicket(event: UseTicket): void {
  let entity = Ticket.load(event.params.ticketId.toHex());
  if (entity !== null) {
    entity.usable = false;
    entity.used = true;
    entity.save();
  }
}

export function handleGenerateSouvenir(event: GenerateSouvenir): void {
  let entity = new Souvenir(event.params.tokenId.toHex());
  entity.owner = event.params.owner;
  entity.tokenId = event.params.tokenId;
  entity.tokenURI = event.params.tokenURI;
  entity.save();

  let ticket = Ticket.load(event.params.ticket.id.toHex());
  if (ticket !== null) {
    ticket.souvenirMinted = true;
    ticket.souvenir = entity.id;
    ticket.save();
  }
}

export function handleBecomeOrganizer(event: BecomeOrganizer): void {
  let entity = new Organizer(event.params.account.toHex());
  entity.account = event.params.account;
  entity.save();
}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleDeposit(event: Deposit): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleTransfer(event: Transfer): void {}

export function handleWithdraw(event: Withdraw): void {}
