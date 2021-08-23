import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

const GET_STATS = gql`
    query getStats($marketType: MarketType) {
        stats(marketType: $marketType) {
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
    const router = useRouter();
    const { marketType } = router.query;
    return useQuery<{ stats: StatsData[] }>(GET_STATS, {
        variables: {
            marketType,
        },
    });
};
