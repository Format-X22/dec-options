import { gql, useLazyQuery } from '@apollo/client';

const GET_STATS = gql`
    query getStats($marketType: MarketType, $base: String) {
        stats(marketType: $marketType, base: $base) {
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
    date: string;
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

interface IProps {
    base?: string;
    marketType?: string;
}

export const useStatsData = ({ base, marketType }: IProps) => {
    return useLazyQuery<{ stats: StatsData[] }>(GET_STATS, {
        variables: {
            marketType,
            base,
        },
    });
};
