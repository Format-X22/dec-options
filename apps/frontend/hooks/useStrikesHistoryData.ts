import { useMemo } from 'react';
import { StatsData } from './useStatsData';

export const useStrikeHistoryData = (
    base: string,
    date: string,
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
                .forEach(({ date: statDate, details }) => {
                    details
                        .filter((detail) => {
                            return (
                                new Date(detail.expirationDate).getDate() === new Date(date).getDate() &&
                                new Date(detail.expirationDate).getMonth() === new Date(date).getMonth() &&
                                new Date(detail.expirationDate).getFullYear() === new Date(date).getFullYear() &&
                                detail.strike === +strike &&
                                detail.type.toLowerCase() === type
                            );
                        })
                        .forEach(({ volume, openInterest, impliedVolatility }) => {
                            const statDateTime = new Date(statDate).getTime();
                            if (!retObj[statDate]) {
                                retObj[statDate] = {
                                    volume: 0,
                                    openInterest: 0,
                                    impliedVolatility: 0,
                                    impliedVolatilityCount: 0,
                                };
                            }
                            retObj[statDate] = {
                                volume: retObj[statDate].volume + volume,
                                openInterest: retObj[statDate].openInterest + openInterest,
                                impliedVolatility: (retObj[statDate].impliedVolatility || 0) + impliedVolatility,
                                impliedVolatilityCount: retObj[statDate].impliedVolatilityCount + 1,
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
    }, [base, dataStats, date, strike, type]);
};
