import { gql, useQuery } from '@apollo/client';

const GET_STATS = gql`
    query getStats {
        stats {
            base
            date
            volume
            openInterest
            marketKey
            details {
                expirationDate
                strike
                openInterest
                volume
                impliedVolatility
                type
            }
        }
    }
`;

export type StatsData = {
    base: string;
    date: Date;
    volume: number;
    openInterest: number;
    marketKey: string;
    details: {
        strike: number;
        volume: number;
        openInterest: number;
        impliedVolatility: number;
        type: string;
        expirationDate: string;
    }[];
};

export const useStatsData = () => {
    return useQuery<{ stats: StatsData[] }>(GET_STATS);
};
