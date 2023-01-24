import { gql } from '@apollo/client';

export const EVENTS_QUERY = gql`
    query {
        createEvents(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
            id
            eventId
        }
    }
`;

export const TICKETS_QUERY = gql`
    query ($owner: String!) {
        buyTickets(where: { owner: $owner }) {
            tokenId
            tokenURI
        }
        acceptBuyOffers(where: { buyer: $owner }) {
            offerId
            eventId
            ticketTypeId
            ticketId
            tokenURI
        }
        acceptSellOffers(where: { buyer: $owner }) {
            offerId
            eventId
            ticketTypeId
            ticketId
            tokenURI
        }
    }
`;

export const EVENTS_BY_ORGANIZER_QUERY = gql`
    query Events($creator: String!) {
        createEvents(where: { creator: $creator }) {
            eventId
        }
    }
`;

export const BUY_TICKETS_EVENT_QUERY = gql`
    query Events {
        createEvents {
            eventId
        }
    }
`;

export const SELL_TICKETS_QUERY = gql`
    query Tickets($owner: String!) {
        buyTickets(where: { owner: $owner }) {
            eventId
            ticketTypeId
            tokenId
        }
        acceptBuyOffers(where: { buyer: $owner }) {
            offerId
            eventId
            ticketTypeId
            ticketId
            tokenURI
        }
        acceptSellOffers(where: { buyer: $owner }) {
            offerId
            eventId
            ticketTypeId
            ticketId
            tokenURI
        }
    }
`;

export const AVAILABLE_TICKETS_FOR_EVENT = gql`
    query Tickets($eventId: String!) {
        createTicketTypes(where: { eventId: $eventId }) {
            eventId
            ticketType_id
            ticketType_name
        }
    }
`;

export const CURRENT_EVENT_BY_ID_QUERY = gql`
    query Event($eventId: String!) {
        createEvents(where: { eventId: $eventId }) {
            eventId
            blockTimestamp
        }
        buyTickets(where: { eventId: $eventId }) {
            ticketTypeId
            tokenId
            blockTimestamp
        }
    }
`;
export const OFFERS_QUERY = gql`
    query Offers {
        createBuyOffers(orderBy: blockTimestamp, orderDirection: desc) {
            id
            offerId
            eventId
            ticketTypeId
            price
            buyer
            blockTimestamp
        }
        createSellOffers(orderBy: blockTimestamp, orderDirection: desc) {
            id
            offerId
            eventId
            ticketTypeId
            ticketId
            price
            seller
            blockTimestamp
        }
    }
`;

export const TICKET_QUERY = gql`
    query ($owner: String!, $eventId: String!, $ticketTypeId: String!) {
        buyTickets(where: { owner: $owner, eventId: $eventId, ticketTypeId: $ticketTypeId }) {
            tokenId
        }
        acceptBuyOffers(where: { buyer: $owner, eventId: $eventId, ticketTypeId: $ticketTypeId }) {
            ticketId
        }
        acceptSellOffers(where: { buyer: $owner, eventId: $eventId, ticketTypeId: $ticketTypeId }) {
            ticketId
        }
    }
`;
