import { gql } from '@apollo/client';

export const EVENTS_QUERY = gql`
    query Events($first: Int!, $skip: Int!) {
        events(
            orderBy: createdAt, 
            orderDirection: desc, 
            skip: $skip, 
            first: $first, 
            where: { deleted: false, startTime_gt: ${Math.floor(Date.now() / 1000)} 
        }) {
            id
            creator
            name
            description
            eventStorage
            location
            startTime
            endTime
        }
    }
`;

export const TICKETS_QUERY = gql`
    query Tickets($owner: String!, $event: String!, $ticketType: String!) {
        tickets(
            where: {
                owner: $owner
                event_: { id: $event }
                ticketType_: { id: $ticketType }
                usable: true
            }
        ) {
            id
            owner
            tokenURI
            usable
        }
    }
`;

export const EVENT_AND_TICKETS_QUERY = gql`
    query EventAndTickets($event: String!) {
        event(id: $event) {
            id
            creator
            name
            description
            eventStorage
            location
            startTime
            endTime
            createdAt
            ticketTypes {
                id
                name
                price
                maxSupply
                currentSupply
                deleted
            }
        }

        tickets(where: { event_: { id: $event } }) {
            id
            owner
            timestamp
            ticketType {
                id
            }
        }
    }
`;

export const EVENTS_BY_CREATOR_QUERY = gql`
    query EventsByCreator($creator: String, $first: Int!, $skip: Int!) {
        events(where: { creator: $creator, deleted: false }, first: $first, skip: $skip) {
            id
            creator
            name
            description
            eventStorage
            location
            startTime
            endTime
        }
    }
`;

export const ALL_TICKETS_BY_OWNER_QUERY = gql`
    query TicketsByOwner($owner: String!, $first: Int!, $skip: Int!) {
        tickets(
            orderBy: tokenId
            orderDirection: desc
            where: { owner: $owner }
            first: $first
            skip: $skip
        ) {
            id
            owner
            tokenId
            tokenURI
            usable
            used
            souvenirMinted
            event {
                id
                creator
                name
                description
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                price
                maxSupply
                currentSupply
            }
        }
    }
`;

export const SOUVENIRS_BY_OWNER_QUERY = gql`
    query SouvenirsByOwner($owner: String!, $first: Int!, $skip: Int!) {
        souvenirs(where: { owner: $owner }, first: $first, skip: $skip) {
            id
            tokenId
            tokenURI
            owner
            ticket {
                event {
                    name
                }
                ticketType {
                    name
                }
            }
        }
    }
`;

export const BUY_TICKETS_EVENT_QUERY = gql`
    query BuyTicketsEvent {
        events(orderBy: createdAt, orderDirection: desc, where: { deleted: false }) {
            id
            name
            startTime
            ticketTypes(where: { deleted: false }) {
                id
                name
                event {
                    id
                    name
                }
            }
        }
    }
`;

export const SELL_TICKETS_QUERY = gql`
    query SellTickets($owner: String!) {
        tickets(where: { owner: $owner }) {
            tokenId
            event {
                id
                name
                startTime
                ticketTypes(where: { deleted: false }) {
                    id
                    name
                    event {
                        id
                        name
                    }
                }
            }
            ticketType {
                id
                name
            }
        }
    }
`;

export const BUY_OFFERS_QUERY = gql`
    query Offers($first: Int!, $skip: Int!, $account: String!) {
        offers(
            first: $first,
            skip: $skip,
            where: {
                deleted: false,
                buyOffer: true,
                buyer_not: $account,
                event_: { startTime_gt: ${Math.floor(Date.now() / 1000)} }
            }
        ) {
            id
            buyer
            seller
            buyOffer
            sellOffer
            price
            event {
                id
                name
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                tokenURI
            }
            ticket {
                id
                tokenId
            }
        }
    }
`;

export const SELL_OFFERS_QUERY = gql`
    query Offers($first: Int!, $skip: Int!, $account: String!) {
        offers(
            first: $first,
            skip: $skip,
            where: {
                deleted: false,
                sellOffer: true,
                seller_not: $account,
                event_: { startTime_gt: ${Math.floor(Date.now() / 1000)} }
            }
        ) {
            id
            buyer
            seller
            buyOffer
            sellOffer
            price
            event {
                id
                name
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                tokenURI
            }
            ticket {
                id
                tokenId
            }
        }
    }
`;

export const EVENT_BY_ID_QUERY = gql`
    query EventById($id: String!) {
        event(id: $id) {
            id
            creator
            name
            description
            eventStorage
            location
            startTime
            endTime
        }
    }
`;

export const EVENT_WITH_TYPES_BY_ID_QUERY = gql`
    query EventById($id: String!) {
        event(id: $id) {
            id
            creator
            ticketTypes(where: { deleted: false }) {
                id
                name
                price
                maxSupply
                currentSupply
                tokenURI
                souvenirTokenURI
            }
        }
    }
`;

export const EVENT_BY_ID_WITH_TICKETS_QUERY = gql`
    query EventById($id: String!) {
        event(id: $id) {
            id
            creator
            name
            description
            eventStorage
            location
            startTime
            endTime
            ticketTypes(where: { deleted: false }) {
                id
                name
                price
                maxSupply
                currentSupply
                tokenURI
                souvenirTokenURI
            }
        }
    }
`;

export const USER_SELL_OFFERS_QUERY = gql`
    query UserSellOffers($account: String!, $first: Int!, $skip: Int!) {
        offers(
            first: $first
            skip: $skip
            where: { deleted: false, sellOffer: true, seller: $account }
        ) {
            id
            buyer
            seller
            buyOffer
            sellOffer
            price
            event {
                id
                name
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                tokenURI
            }
            ticket {
                id
                tokenId
            }
        }
    }
`;

export const USER_BUY_OFFERS_QUERY = gql`
    query UserBuyOffers($account: String!, $first: Int!, $skip: Int!) {
        offers(
            first: $first
            skip: $skip
            where: { deleted: false, buyOffer: true, buyer: $account }
        ) {
            id
            buyer
            seller
            buyOffer
            sellOffer
            price
            event {
                id
                name
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                tokenURI
            }
            ticket {
                id
                tokenId
            }
        }
    }
`;

export const IS_ORGANIZER_QUERY = gql`
    query IsOrganizer($account: String!) {
        organizers(where: { account: $account }) {
            id
        }
    }
`;

export const USED_TICKETS_BY_OWNER_QUERY = gql`
    query TicketsByOwner($owner: String!, $first: Int!, $skip: Int!) {
        tickets(
            orderBy: tokenId
            orderDirection: desc
            where: { owner: $owner, usable: false, used: true }
            first: $first
            skip: $skip
        ) {
            id
            owner
            tokenId
            tokenURI
            usable
            used
            souvenirMinted
            event {
                id
                creator
                name
                description
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                price
                maxSupply
                currentSupply
            }
        }
    }
`;

export const USED_NOT_MINTED_TICKETS_BY_OWNER_QUERY = gql`
    query TicketsByOwner($owner: String!, $first: Int!, $skip: Int!) {
        tickets(
            orderBy: tokenId
            orderDirection: desc
            where: { owner: $owner, usable: false, used: true, souvenirMinted: false }
            first: $first
            skip: $skip
        ) {
            id
            owner
            tokenId
            tokenURI
            usable
            used
            souvenirMinted
            event {
                id
                creator
                name
                description
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                price
                maxSupply
                currentSupply
            }
        }
    }
`;

export const CURRENT_TICKETS_BY_OWNER_QUERY = gql`
    query TicketsByOwner($owner: String!, $first: Int!, $skip: Int!) {
        tickets(
            orderBy: tokenId
            orderDirection: desc
            where: { owner: $owner, usable: true, used: false, souvenirMinted: false }
            first: $first
            skip: $skip
        ) {
            id
            owner
            tokenId
            tokenURI
            usable
            used
            souvenirMinted
            event {
                id
                creator
                name
                description
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                price
                maxSupply
                currentSupply
            }
        }
    }
`;

export const OFFERED_TICKETS_BY_OWNER_QUERY = gql`
    query TicketsByOwner($owner: String!, $first: Int!, $skip: Int!) {
        tickets(
            orderBy: tokenId
            orderDirection: desc
            where: { owner: $owner, usable: false, used: false, souvenirMinted: false }
            first: $first
            skip: $skip
        ) {
            id
            owner
            tokenId
            tokenURI
            usable
            used
            souvenirMinted
            event {
                id
                creator
                name
                description
                eventStorage
                location
                startTime
                endTime
            }
            ticketType {
                id
                name
                price
                maxSupply
                currentSupply
            }
        }
    }
`;
