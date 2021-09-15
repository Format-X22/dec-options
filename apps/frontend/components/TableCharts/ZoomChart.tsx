import { FC } from 'react';
import styled from 'styled-components';
import Highcharts, { color } from 'highcharts';
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
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1,
                },
                stops: [
                    [0, '#71ABD2'],
                    [1, color ? (color('#71ABD2').setOpacity(0).get('rgba') as string) : '#71ABD2'],
                ],
            },
            marker: {
                radius: 2,
            },
            lineWidth: 1,
            states: {
                hover: {
                    lineWidth: 1,
                },
            },
            threshold: null,
        },
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: false,
            },
        },
    },
    colors: [
        '#71ABD2',
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

const ZoomChart: FC<IProps> = ({ chartKey, data, dataTitle, base }) => {
    const series = [
        {
            type: 'area',
            name: dataTitle,
            data: data.map((marketData) => +marketData[chartKey].toFixed(2)),
            dates: data.map(({ date }) => {
                const dateObject = new Date(date);
                return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' }).format(dateObject);
            }),
            marker: {
                radius: 2,
                symbol: 'circle',
            },
        },
    ];
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
                            text: base,
                        },
                    },
                    tooltip: {
                        valueSuffix: ` ${base}`,
                    },
                    series,
                    chart: {
                        zoomType: 'x',
                        height: 375,
                    },
                }}
            />
        </ChartsCol>
    );
};

export default ZoomChart;
