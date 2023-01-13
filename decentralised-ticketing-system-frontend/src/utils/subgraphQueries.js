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
    query Events($creator: String!, $timestamp: String!) {
        createEvents(where: { creator: $creator, startTime_lte: $timestamp }) {
            id
            eventId
        }
    }
`;
