import { gql } from '@apollo/client';

export const EVENTS_QUERY = gql`
    query {
        createEvents(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
            id
            eventId
        }
    }
`;

export const TICKET_QUERY = gql`
    query ($owner: String!) {
        buyTickets(where: { owner: $owner }) {
            tokenId
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
    }
`;

export const TICKET_SALES_QUERY = gql`
    query TicketSales($eventId: String!) {
        buyTickets(where: { eventId: $eventId }) {
            ticketTypeId
            tokenId
            blockTimestamp
        }
    }
`;

export const BUY_OFFERS_QUERY = gql`
    query BuyOffers {
        createBuyOffers(orderBy: blockTimestamp, orderDirection: desc) {
            id
            offerId
            eventId
            ticketTypeId
            price
            buyer
            blockTimestamp
        }
    }
`;

export const SELL_OFFERS_QUERY = gql`
    query SellOffers {
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
