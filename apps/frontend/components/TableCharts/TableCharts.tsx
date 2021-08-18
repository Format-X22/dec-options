import React, { useMemo } from 'react';
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
    const { loading: loadingStats, data: dataStats } = useStatsData();
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
    console.log(dataByBase);

    return (
        <ChartsRow>
            {!loadingStats && (
                <StatChart
                    type='area'
                    title='Total options open interest history'
                    data={dataByBase}
                    chartKey='openInterest'
                />
            )}
            {!loadingStats && (
                <StatChart type='column' title='Total options volume history' data={dataByBase} chartKey='volume' />
            )}
        </ChartsRow>
    );
};

export default TableCharts;
