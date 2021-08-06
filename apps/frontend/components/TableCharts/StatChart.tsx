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

interface IProps {
    type: 'area' | 'column';
    title: string;
    chartKey: 'volume' | 'openInterest';
    data: {
        [base: string]: {
            [marketKey: string]: {
                volume: number;
                openInterest: number;
                date: Date;
            }[];
        };
    };
}

const StatChart: FC<IProps> = ({ type, title, chartKey, data }) => {
    const baseList = Object.keys(data);
    const [selectedBase, setSelectedBase] = useState(baseList[0]);
    const series =
        data && selectedBase
            ? Object.keys(data[selectedBase]).map((marketKey) => ({
                  name: marketKey.toLocaleLowerCase(),
                  data: data[selectedBase][marketKey].map((marketData) => +marketData[chartKey].toFixed(2)),
                  dates: data[selectedBase][marketKey].map(({ date }) => {
                      const dateObject = new Date(date);
                      return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' }).format(dateObject);
                  }),
                  marker: {
                      radius: 1,
                      symbol: 'circle',
                  },
              }))
            : [];
    console.log(series);
    const a = 2;
    return (
        <ChartsCol>
            <ChartsHeader>
                <h3>{title}</h3>
                <div>
                    {baseList.map((base) => (
                        <button
                            a={2}
                            key={base}
                            type='button'
                            className={selectedBase === base ? 'active' : ''}
                            onClick={() => setSelectedBase(base)}
                        >
                            {base}
                        </button>
                    ))}
                </div>
            </ChartsHeader>
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
                            text: selectedBase,
                        },
                    },
                    tooltip: {
                        valueSuffix: ` ${selectedBase}`,
                    },
                    series,
                    chart: {
                        type,
                        height: 250,
                    },
                }}
            />
        </ChartsCol>
    );
};

export default StatChart;
