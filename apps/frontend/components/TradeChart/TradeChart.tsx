import React, { FC } from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getHistoryChartOptions } from './getHistoryChartOptions';
import { getTotalValueChartOptions } from './getTotalValueChartOptions';
import { Spinner } from '../Spinner';

const ChartsCol = styled.div`
    background-color: #3d3d3d;
    min-width: 50%;
    margin-bottom: 24px;
    border-radius: 6px;
    position: relative;
    &:last-child {
        margin-bottom: 0;
    }

    svg {
        box-sizing: border-box;
        border-radius: 6px;
        width: 100%;
    }
    .highcharts-container {
        width: 100% !important;
    }
    .highcharts-background {
        fill: #3d3d3d;
    }
    .highcharts-plot-background {
        fill: #3a3a3a;
    }
    .highcharts-grid-line {
        stroke: #343434;
    }
    .highcharts-axis-line {
        stroke: #343434;
    }
`;

const NoDataMessage = styled.p`
    position: absolute;
    top: 50%;
    left: 50%;
    color: #929ca8;
    cursor: pointer;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.32px;
    line-height: 18px;
    z-index: 20;
    transform: translate(-50%);
`;

interface IProps {
    type: 'area' | 'column';
    dataTitle: string;
    base: string;
    chartKey: 'volume' | 'openInterest' | 'impliedVolatility';
    data: {
        volume: number;
        openInterest: number;
        impliedVolatility: number;
        date: string;
    }[];
    loading?: boolean;
}

const TradeChart: FC<IProps> = ({ type = 'area', chartKey, data, dataTitle, base, loading }) => {
    const historyChartOptions =
        type === 'area'
            ? getHistoryChartOptions({ base, type, chartKey, dataTitle, data })
            : getTotalValueChartOptions({ base, type, chartKey, dataTitle, data });
    return (
        <ChartsCol>
            {loading && <Spinner />}
            {historyChartOptions.series[0].data.length === 0 && (
                <NoDataMessage>No data available. Please try to reload page later.</NoDataMessage>
            )}
            <HighchartsReact highcharts={Highcharts} options={historyChartOptions} />
        </ChartsCol>
    );
};

export default TradeChart;
