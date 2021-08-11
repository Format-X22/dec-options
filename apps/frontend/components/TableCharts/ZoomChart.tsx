import { FC, useState } from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const options: Highcharts.Options = {
    title: {
        text: '',
    },
    credits: {
        enabled: false,
    },
    xAxis: {
        tickmarkPlacement: 'on',
    },
    yAxis: {
        opposite: true,
        labels: {
            align: 'center',
            formatter: function () {
                return `${this.value}`;
            },
        },
    },
    tooltip: {
        split: true,
    },
    plotOptions: {
        area: {
            stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
                lineWidth: 1,
                lineColor: '#666666',
            },
        },
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: false,
            },
        },
    },
    colors: [
        '#8085B5',
        '#79C971',
        '#BF618F',
        '#975FC7',
        '#5C6DC6',
        '#C6A064',
        '#C6CC6A',
        '#77a1e5',
        '#c42525',
        '#a6c96a',
    ],
    legend: {
        align: 'left',
        verticalAlign: 'top',
        itemStyle: {
            color: '#929CA8',
            letterSpacing: '0.32px',
            cursor: 'pointer',
            fontSize: '12px',
            'line-height': '18px',
            fontWeight: '400',
            textOverflow: 'ellipsis',
            'text-transform': 'capitalize',
        },
        itemHoverStyle: {
            color: '#ffffff',
        },
    },
};

const ChartsCol = styled.div`
    background-color: #282828;
    min-width: 50%;
    margin-right: 2px;
    &:last-child {
        margin-right: 0;
    }

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

interface IProps {
    chartKey: 'volume' | 'openInterest' | 'impliedVolatility';
    data: {
        [marketKey: string]: {
            volume: number;
            openInterest: number;
            date: Date;
        }[];
    };
}

const ZoomChart: FC<IProps> = ({ chartKey, data }) => {
    const series = data
        ? Object.keys(data).map((marketKey) => ({
              name: marketKey.toLocaleLowerCase(),
              data: data[marketKey].map((marketData) => +marketData[chartKey].toFixed(2)),
              dates: data[marketKey].map(({ date }) => {
                  const dateObject = new Date(date);
                  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' }).format(dateObject);
              }),
              marker: {
                  radius: 2,
                  symbol: 'circle',
              },
          }))
        : [];
    return (
        <ChartsCol>
            <HighchartsReact
                highcharts={Highcharts}
                options={{
                    ...options,
                    xAxis: {
                        ...options.xAxis,
                        categories: series.length > 0 ? series[0].dates : [],
                    },
                    yAxis: {
                        ...options.yAxis,
                        title: {
                            text: 'BASE',
                        },
                    },
                    tooltip: {
                        valueSuffix: ` BASE`,
                    },
                    series,
                    chart: {
                        zoomType: 'x',
                        height: 450,
                    },
                }}
            />
        </ChartsCol>
    );
};

export default ZoomChart;
