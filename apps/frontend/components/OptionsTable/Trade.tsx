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
`;

const Trade = () => {
    const router = useRouter();
    const { date, strike, base, type } = router.query as unknown as ITradeQuery;
    const { loading: loadingStats, data: dataStats } = useStatsData();
    const dataByBase = useMemo(() => {
        const returnValue: { volume: number; openInterest: number; impliedVolatility: number; date: string }[] = [];
        if (dataStats) {
            dataStats.stats
                .filter((stat) => stat.base === base)
                .forEach(({ details }) => {
                    details
                        .filter(
                            (detail) =>
                                new Date(detail.expirationDate).setHours(0, 0, 0, 0) ===
                                    new Date(date).setHours(0, 0, 0, 0) &&
                                detail.strike === +strike &&
                                detail.type.toLowerCase() === type,
                        )
                        .forEach(({ volume, openInterest, impliedVolatility }) => {
                            returnValue.push({
                                volume,
                                openInterest,
                                impliedVolatility,
                                date,
                            });
                        });
                });
        }
        return returnValue;
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
