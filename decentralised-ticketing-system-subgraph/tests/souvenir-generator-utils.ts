import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  SouvenirGeneratorApproval,
  SouvenirGeneratorApprovalForAll,
  GenerateSouvenir,
  OwnershipTransferred,
  SouvenirGeneratorTransfer,
  TransferSouvenir
} from "../generated/SouvenirGenerator/SouvenirGenerator"

export function createSouvenirGeneratorApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): SouvenirGeneratorApproval {
  let souvenirGeneratorApprovalEvent = changetype<SouvenirGeneratorApproval>(
    newMockEvent()
  )

  souvenirGeneratorApprovalEvent.parameters = new Array()

  souvenirGeneratorApprovalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  souvenirGeneratorApprovalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  souvenirGeneratorApprovalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return souvenirGeneratorApprovalEvent
}

export function createSouvenirGeneratorApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): SouvenirGeneratorApprovalForAll {
  let souvenirGeneratorApprovalForAllEvent = changetype<
    SouvenirGeneratorApprovalForAll
  >(newMockEvent())

  souvenirGeneratorApprovalForAllEvent.parameters = new Array()

  souvenirGeneratorApprovalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  souvenirGeneratorApprovalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  souvenirGeneratorApprovalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return souvenirGeneratorApprovalForAllEvent
}

export function createGenerateSouvenirEvent(
  creator: Address,
  receiver: Address,
  tokenId: BigInt,
  tokenURI: string
): GenerateSouvenir {
  let generateSouvenirEvent = changetype<GenerateSouvenir>(newMockEvent())

  generateSouvenirEvent.parameters = new Array()

  generateSouvenirEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  generateSouvenirEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  generateSouvenirEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  generateSouvenirEvent.parameters.push(
    new ethereum.EventParam("tokenURI", ethereum.Value.fromString(tokenURI))
  )

  return generateSouvenirEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createSouvenirGeneratorTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): SouvenirGeneratorTransfer {
  let souvenirGeneratorTransferEvent = changetype<SouvenirGeneratorTransfer>(
    newMockEvent()
  )

  souvenirGeneratorTransferEvent.parameters = new Array()

  souvenirGeneratorTransferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  souvenirGeneratorTransferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  souvenirGeneratorTransferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return souvenirGeneratorTransferEvent
}

export function createTransferSouvenirEvent(
  sender: Address,
  receiver: Address,
  tokenId: BigInt
): TransferSouvenir {
  let transferSouvenirEvent = changetype<TransferSouvenir>(newMockEvent())

  transferSouvenirEvent.parameters = new Array()

  transferSouvenirEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  transferSouvenirEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  transferSouvenirEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferSouvenirEvent
}
