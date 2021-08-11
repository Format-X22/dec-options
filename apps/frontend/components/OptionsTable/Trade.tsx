import { gql, useQuery } from '@apollo/client';
import { ITradeQuery } from '../../dtos/ITradeQuery';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import ZoomChart from '../TableCharts/ZoomChart';

const TradeComingSoon = styled.div`
    background: #303030;
    padding: 31px;
    font-size: 22px;
`;

const GET_STATS = gql`
    query getStats {
        stats {
            base
            date
            volume
            openInterest
            marketKey
            type
            details {
                expirationDate
                strike
                openInterest
                volume
                impliedVolatility
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
    }[];
};

const Trade = () => {
    const router = useRouter();
    const { date, strike, base, type } = router.query as unknown as ITradeQuery;
    const { loading: loadingStats, data: dataStats } = useQuery<{ stats: StatsData[] }>(GET_STATS);
    // console.log(dataStats.stats);
    const dataByBase = useMemo(() => {
        const returnValue = {};
        if (dataStats) {
            dataStats.stats
                .filter((stat) => {
                    // console.log(stat.date, date, new Date(stat.date), new Date(date), new Date(stat.date).setHours(0,0,0,0) === new Date(date).setHours(0,0,0,0));
                    return (
                        new Date(stat.date).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0) &&
                        stat.base === base
                    );
                })
                .forEach(({ details }) => {
                    console.log('DETAILS', details);
                    if (!returnValue['data']) {
                        returnValue['data'] = [];
                    }

                    details
                        .filter((detail) => detail.strike === +strike)
                        .forEach(({ volume, openInterest, impliedVolatility }) => {
                            returnValue['data'].push({
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

    console.log(dataByBase);
    return (
        <TradeComingSoon>
            {!loadingStats && <ZoomChart data={dataByBase} chartKey='openInterest' />}
            {!loadingStats && <ZoomChart data={dataByBase} chartKey='volume' />}
            {!loadingStats && <ZoomChart data={dataByBase} chartKey='impliedVolatility' />}
        </TradeComingSoon>
    );
};

export default Trade;
