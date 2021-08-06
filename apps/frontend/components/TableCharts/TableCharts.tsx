import React, { useMemo } from 'react';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import StatChart from './StatChart';

const ChartsRow = styled.div`
    display: flex;
    margin-bottom: 2px;

    svg {
        border: 1px solid #343434;
        box-sizing: border-box;
    }
    .highcharts-container {
        width: 100% !important;
    }
    .highcharts-background {
        fill: #303030;
    }
    .highcharts-grid-line {
        stroke: #343434;
    }
`;

const GET_STATS = gql`
    query getStats {
        stats {
            base
            date
            volume
            openInterest
            marketKey
        }
    }
`;

export type StatsData = {
    base: string;
    date: Date;
    volume: number;
    openInterest: number;
    marketKey: string;
};

const TableCharts = () => {
    const { loading: loadingStats, data: dataStats } = useQuery<{ stats: StatsData[] }>(GET_STATS);
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
