import { useMemo } from 'react';
import { StatsData } from './useStatsData';

export const useTotalValuesByExpirations = (
    base: string,
    strike: string,
    type: string,
    dataStats?: { stats: StatsData[] },
) => {
    return useMemo(() => {
        const returnValue: {
            marketKey: string;
            volume: number;
            openInterest: number;
            impliedVolatility: number;
            date: string;
            expirationDate: string;
        }[] = [];
        const retObj = {};
        if (dataStats) {
            dataStats.stats
                .filter((stat) => stat.base === base)
                .forEach(({ details }) => {
                    details
                        .filter(
                            (detail) =>
                                new Date(detail.expirationDate).getTime() > new Date().getTime() &&
                                detail.strike === +strike &&
                                detail.type.toLowerCase() === type,
                        )
                        .forEach(({ volume, openInterest, impliedVolatility, expirationDate }) => {
                            if (!retObj[expirationDate]) {
                                retObj[expirationDate] = {
                                    volume: 0,
                                    openInterest: 0,
                                    impliedVolatility: 0,
                                    impliedVolatilityCount: 0,
                                };
                            }
                            retObj[expirationDate] = {
                                volume: retObj[expirationDate].volume + volume,
                                openInterest: retObj[expirationDate].openInterest + openInterest,
                                impliedVolatility: (retObj[expirationDate].impliedVolatility || 0) + impliedVolatility,
                                impliedVolatilityCount: retObj[expirationDate].impliedVolatilityCount + 1,
                            };
                        });
                });
        }
        Object.keys(retObj).map((date) => {
            const dateObj = retObj[date];
            const { impliedVolatility, impliedVolatilityCount } = dateObj;
            const ivAvg = impliedVolatility / impliedVolatilityCount;
            returnValue.push({
                date,
                ...dateObj,
                impliedVolatility: ivAvg,
            });
        });
        return returnValue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [dataStats, base, strike, type]);
};
