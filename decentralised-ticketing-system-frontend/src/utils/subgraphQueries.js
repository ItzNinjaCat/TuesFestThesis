import { gql } from '@apollo/client';

export const EVENTS_QUERY = gql`
    query {
        createEvents(first: 10) {
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
