import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import StatChart from './StatChart';
import { useStatsData } from '../../hooks/useStatsData';

const ChartsRow = styled.div`
    display: flex;
    margin-bottom: 2px;

    @media all and (max-width: 768px) {
        flex-direction: column;
    }
`;

const TableCharts = () => {
    const router = useRouter();
    const [getStats, { loading: loadingStats, data: dataStats }] = useStatsData({
        marketType: router.query.marketType as string,
    });
    useEffect(() => {
        setTimeout(() =>
            getStats({
                variables: {
                    marketType: router.query.marketType,
                },
            }),
        );
    }, []);
    const dataByBase = useMemo(() => {
        const returnValue = {};
        if (dataStats) {
            dataStats.stats.forEach(({ base, date, volume, openInterest, marketKey }) => {
                if (!returnValue[base]) {
                    returnValue[base] = {};
                }
                if (!returnValue[base][marketKey]) {
                    returnValue[base][marketKey] = [];
                }

                returnValue[base][marketKey].push({
                    volume,
                    openInterest,
                    date,
                });
            });
        }
        return returnValue;
    }, [dataStats]);

    return (
        <ChartsRow>
            <StatChart
                type='area'
                title='Total options open interest history'
                data={dataByBase}
                chartKey='openInterest'
                loading={loadingStats || !dataStats}
            />
            <StatChart
                type='column'
                title='Total options volume history'
                data={dataByBase}
                chartKey='volume'
                loading={loadingStats || !dataStats}
            />
        </ChartsRow>
    );
};

export default TableCharts;
