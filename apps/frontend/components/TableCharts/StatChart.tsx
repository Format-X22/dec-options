import { FC, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useRouter } from 'next/router';
import { ContextApp } from 'apps/frontend/pages/_app';

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
    position: relative;
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

    @media all and (max-width: 768px) {
        min-width: 100%;
        margin-right: 0;
    }

    .spinner {
        z-index: 200;
        position: absolute;
        top: calc(50% - 20px);
        left: calc(50% - 20px);
        border: 4px solid #303030; /* Light grey */
        border-top: 4px solid #71abd2; /* Blue */
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 0.9s ease-in-out infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
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

    @media all and (max-width: 576px) {
        flex-direction: column;
        align-items: flex-start;

        div {
            padding: 0 24px;
            margin-bottom: 20px;
            overflow-x: auto;
            width: 100%;
        }
    }
`;

const getColorByMarket = (marketKey: string) => {
    const colorsByMarket = {
        auctus: '#8085B5',
        binance: '#79C971',
        deribit: '#BF618F',
        finnexus: '#975FC7',
        hegic: '#5C6DC6',
        okex: '#C6A064',
        opyn: '#C6CC6A',
        siren: '#77a1e5',
    };

    return colorsByMarket[marketKey.toLocaleLowerCase()];
};

interface IProps {
    type: 'area' | 'column';
    title: string;
    chartKey: 'volume' | 'openInterest' | 'impliedVolatility';
    loading: boolean;
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

const StatChart: FC<IProps> = ({ type, title, chartKey, loading, data }) => {
    const router = useRouter();
    const { base } = router.query as { base: string };
    const { state } = useContext(ContextApp);
    const baseList = Object.keys(data);
    const [selectedBase, setSelectedBase] = useState(state.filter.currency);
    useEffect(() => {
        if (base) {
            setSelectedBase(base);
        }
    }, [base]);
    const series = useMemo(() => {
        return data && selectedBase && data[selectedBase]
            ? Object.keys(data[selectedBase])
                  .map((marketKey) => {
                      const sortedData = data[selectedBase][marketKey].sort(
                          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                      );
                      return {
                          name: marketKey.toLocaleLowerCase(),
                          data: sortedData.map((marketData) => +marketData[chartKey].toFixed(2)),
                          dates: sortedData.map(({ date }) => {
                              const dateObject = new Date(date);
                              return new Intl.DateTimeFormat('en', {
                                  month: 'short',
                                  day: '2-digit',
                                  timeZone: 'UTC',
                              }).format(dateObject);
                          }),
                          marker: {
                              radius: 1,
                              symbol: 'circle',
                          },
                          color: getColorByMarket(marketKey),
                      };
                  })
                  .filter(({ data }) => Math.max(...data) > 0)
                  .sort((a, b) => a.name.localeCompare(b.name))
            : [];
    }, [data, selectedBase, chartKey]);

    const biggestDatesArr = series.reduce((a, b) => {
        return a.length > b.dates.length ? a : b.dates;
    }, []);

    return (
        <ChartsCol>
            {loading && <div className='spinner' />}
            <ChartsHeader>
                <h3>{title}</h3>
                <div>
                    {baseList
                        .filter((base) =>
                            Object.keys(data[base]).some((marketKey) => data[selectedBase][marketKey].length > 0),
                        )
                        .map((base) => (
                            <button
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
                    loading: true,
                    xAxis: {
                        ...options.xAxis,
                        categories: biggestDatesArr,
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
