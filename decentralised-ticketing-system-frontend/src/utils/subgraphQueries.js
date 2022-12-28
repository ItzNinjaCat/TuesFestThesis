import { gql } from '@apollo/client';

export const EVENTS_QUERY = gql`
    query {
        createEvents(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
            id
            eventId
            eventStorage
            creator
            description
            name
            blockTimestamp
        }
    }
`;
