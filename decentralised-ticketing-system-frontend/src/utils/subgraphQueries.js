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
    query {
        createEvents(where: { creator: $creator }) {
            id
            eventId
        }
    }
`;

export const CURRENT_EVENTS_BY_ORGANIZER_QUERY = gql`
    query Events($creator: String!) {
        createEvents(where: { creator: $creator }) {
            id
            eventId
        }
    }
`;

export const BUY_TICKETS_EVENT_QUERY = gql`
    query Events {
        createEvents {
            id
            eventId
            name
        }
    }
`;

export const SELL_TICKETS_QUERY = gql`
    query Tickets($owner: String!) {
        buyTickets(where: { owner: $owner }) {
            id
            eventId
            ticketTypeId
            tokenId
        }
    }
`;

export const AVAILABLE_TICKETS_FOR_EVENT = gql`
    query Tickets($eventId: String!) {
        createTicketTypes(where: { eventId: $eventId }) {
            id
            eventId
            ticketType_id
            ticketType_name
        }
    }
`;

export const CURRENT_EVENT_BY_ID_QUERY = gql`
    query Event($eventId: String!) {
        createEvents(where: { eventId: $eventId }) {
            id
            eventId
            name
            description
            eventStorage
            startTime
            endTime
            blockTimestamp
        }
    }
`;

export const TICKEY_TYPES_BY_EVENTID_QUERY = gql`
    query TicketTypes($eventId: String!) {
        createTicketTypes(where: { eventId: $eventId }) {
            eventId
            ticketType_id
            ticketType_name
            ticketType_price
            ticketType_maxSupply
            ticketType_currentSupply
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
