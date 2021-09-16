import { FC } from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useHistoryChartOptions } from 'apps/frontend/hooks/useHistoryChartOptions';

const ChartsCol = styled.div`
    background-color: #3d3d3d;
    min-width: 50%;
    margin-bottom: 24px;
    border-radius: 6px;
    &:last-child {
        margin-bottom: 0;
    }

    svg {
        box-sizing: border-box;
        border-radius: 6px;
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
}

const ZoomChart: FC<IProps> = ({ type = 'area', chartKey, data, dataTitle, base }) => {
    const historyChartOptions = useHistoryChartOptions({ base, type, chartKey, dataTitle, data });
    return (
        <ChartsCol>
            <HighchartsReact highcharts={Highcharts} options={historyChartOptions} />
        </ChartsCol>
    );
};

export default ZoomChart;
