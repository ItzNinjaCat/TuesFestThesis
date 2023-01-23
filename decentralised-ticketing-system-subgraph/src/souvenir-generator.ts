import {
  SouvenirGeneratorApproval as SouvenirGeneratorApprovalEvent,
  SouvenirGeneratorApprovalForAll as SouvenirGeneratorApprovalForAllEvent,
  GenerateSouvenir as GenerateSouvenirEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SouvenirGeneratorTransfer as SouvenirGeneratorTransferEvent,
  TransferSouvenir as TransferSouvenirEvent
} from "../generated/SouvenirGenerator/SouvenirGenerator"
import {
  SouvenirGeneratorApproval,
  SouvenirGeneratorApprovalForAll,
  GenerateSouvenir,
  OwnershipTransferred,
  SouvenirGeneratorTransfer,
  TransferSouvenir
} from "../generated/schema"

export function handleSouvenirGeneratorApproval(
  event: SouvenirGeneratorApprovalEvent
): void {
  let entity = new SouvenirGeneratorApproval(
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

export function handleSouvenirGeneratorApprovalForAll(
  event: SouvenirGeneratorApprovalForAllEvent
): void {
  let entity = new SouvenirGeneratorApprovalForAll(
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

export function handleGenerateSouvenir(event: GenerateSouvenirEvent): void {
  let entity = new GenerateSouvenir(
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

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSouvenirGeneratorTransfer(
  event: SouvenirGeneratorTransferEvent
): void {
  let entity = new SouvenirGeneratorTransfer(
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

export function handleTransferSouvenir(event: TransferSouvenirEvent): void {
  let entity = new TransferSouvenir(
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
