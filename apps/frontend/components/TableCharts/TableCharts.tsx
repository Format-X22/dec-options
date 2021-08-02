import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import { gql } from '@apollo/client';

const options: Highcharts.Options = {
    title: {
        text: '',
    },
    credits: {
        enabled: false,
    },
    xAxis: {
        categories: [
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
            'Feb 25',
        ],
        tickmarkPlacement: 'on',
        title: {
            enabled: false,
        },
        zoomType: 'x',
    },
    yAxis: {
        title: {
            text: 'Billions',
        },
        opposite: true,
        labels: {
            align: 'center',
            formatter: function () {
                return this.value;
            },
        },
    },
    tooltip: {
        split: true,
        valueSuffix: ' billions',
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
        },
        itemHoverStyle: {
            color: '#ffffff',
        },
    },
    series: [
        {
            name: 'Bit.com',
            data: [1, 2, 2, 1, 3, 1, 3, 1, 2, 2, 1, 3, 1, 3],
        },
        {
            name: 'Huobi',
            data: [1, 2, 2, 1, 3, 1, 3, 1, 2, 2, 1, 3, 1, 3],
        },
        {
            name: 'Okex',
            data: [1, 2, 2, 1, 3, 1, 3, 1, 2, 2, 1, 3, 1, 3],
        },
        {
            name: 'CME',
            data: [1, 2, 2, 1, 3, 1, 3, 1, 2, 2, 1, 3, 1, 3],
        },
        {
            name: 'FTX',
            data: [1, 2, 2, 1, 3, 1, 3, 1, 2, 2, 1, 3, 1, 3],
        },
        {
            name: 'LedgerX',
            data: [1, 1, 1, 1, 2, 3, 2, 1, 2, 2, 1, 3, 1, 3],
        },
        {
            name: 'Deribit',
            data: [6, 5, 6, 7, 6, 8, 10, 1, 2, 2, 1, 3, 1, 3],
        },
    ],
};

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

const ChartsCol = styled.div`
    background-color: #282828;
    min-width: 50%;
    margin-right: 2px;
    &:last-child {
        margin-right: 0;
    }
`;

const ChartsHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
        margin: 0;
        padding: 24px;
        font-size: 14px;
        line-height: 18px;
        color: #f3f3f3;
    }

    div {
        display: flex;
        align-items: center;
    }

    button {
        border-radius: 4px;
        padding: 7px 16px;
        font-size: 14px;
        line-height: 18px;
        color: #e6e6e6;
        margin-right: 4px;
        background-color: #282828;
        border: none;
        cursor: pointer;

        &.active,
        &:hover {
            background: #393939;
        }
    }
`;

// const GET_STATS = gql`
//     query getStats {
//         stats {
//             usdPrice
//             symbol
//         }
//     }
// `;

const TableCharts = () => {
    return (
        <ChartsRow>
            <ChartsCol>
                <ChartsHeader>
                    <h3>Total options open interest history</h3>
                    <div>
                        <button type='button' className='active'>
                            BTC
                        </button>
                        <button type='button'>ETH</button>
                        <button type='button'>YFI</button>
                    </div>
                </ChartsHeader>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                        ...options,
                        chart: {
                            type: 'area',
                            height: 250,
                        },
                    }}
                />
            </ChartsCol>
            <ChartsCol>
                <ChartsHeader>
                    <h3>Total options volume history</h3>
                    <div>
                        <button type='button'>BTC</button>
                        <button type='button' className='active'>
                            ETH
                        </button>
                        <button type='button'>YFI</button>
                    </div>
                </ChartsHeader>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                        ...options,
                        chart: {
                            type: 'column',
                            height: 250,
                        },
                    }}
                />
            </ChartsCol>
        </ChartsRow>
    );
};

export default TableCharts;
