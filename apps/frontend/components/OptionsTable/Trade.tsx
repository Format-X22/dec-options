import { ITradeQuery } from '../../dtos/ITradeQuery';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import ZoomChart from '../TableCharts/ZoomChart';
import { useStatsData } from '../../hooks/useStatsData';

const TradeComingSoon = styled.div`
    background: #303030;
    padding-left: 31px;
    font-size: 22px;

    @media all and (max-width: 576px) {
        padding-left: 0;
        padding-top: 30px;
    }
`;

const Trade = () => {
    const router = useRouter();
    const { strike, base, type } = router.query as unknown as ITradeQuery;
    const { loading: loadingStats, data: dataStats } = useStatsData(base);
    const dataByBase = useMemo(() => {
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
    }, [dataStats]);
    return (
        <TradeComingSoon>
            {!loadingStats && (
                <ZoomChart data={dataByBase} chartKey='openInterest' dataTitle='Open Interest' base={base} />
            )}
            {!loadingStats && <ZoomChart data={dataByBase} chartKey='volume' dataTitle='Volume' base={base} />}
            {!loadingStats && (
                <ZoomChart data={dataByBase} chartKey='impliedVolatility' dataTitle='Implied Volatility' base='' />
            )}
        </TradeComingSoon>
    );
};

export default Trade;
