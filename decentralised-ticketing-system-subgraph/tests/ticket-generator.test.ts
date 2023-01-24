import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { AcceptBuyOffer } from "../generated/schema"
import { AcceptBuyOffer as AcceptBuyOfferEvent } from "../generated/TicketGenerator/TicketGenerator"
import { handleAcceptBuyOffer } from "../src/ticket-generator"
import { createAcceptBuyOfferEvent } from "./ticket-generator-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let offerId = Bytes.fromI32(1234567890)
    let buyer = Address.fromString("0x0000000000000000000000000000000000000001")
    let seller = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let eventId = Bytes.fromI32(1234567890)
    let ticketTypeId = Bytes.fromI32(1234567890)
    let ticketId = BigInt.fromI32(234)
    let tokenURI = "Example string value"
    let price = BigInt.fromI32(234)
    let newAcceptBuyOfferEvent = createAcceptBuyOfferEvent(
      offerId,
      buyer,
      seller,
      eventId,
      ticketTypeId,
      ticketId,
      tokenURI,
      price
    )
    handleAcceptBuyOffer(newAcceptBuyOfferEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AcceptBuyOffer created and stored", () => {
    assert.entityCount("AcceptBuyOffer", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "offerId",
      "1234567890"
    )
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "buyer",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seller",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "eventId",
      "1234567890"
    )
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "ticketTypeId",
      "1234567890"
    )
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "ticketId",
      "234"
    )
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenURI",
      "Example string value"
    )
    assert.fieldEquals(
      "AcceptBuyOffer",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
