import { color } from 'highcharts';

interface IProps {
    base: string;
    type: string;
    dataTitle: string;
    chartKey: 'volume' | 'openInterest' | 'impliedVolatility';
    data: {
        volume: number;
        openInterest: number;
        impliedVolatility: number;
        date: string;
    }[];
}

export const getTotalValueChartOptions = ({ base, type, dataTitle, chartKey, data }: IProps) => {
    const dates = data.map(({ date }) => {
        const dateObject = new Date(date);
        return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' }).format(dateObject);
    });
    return {
        title: {
            text: '',
        },
        credits: {
            enabled: false,
        },
        xAxis: {
            categories: dates,
        },
        yAxis: {
            opposite: true,
            labels: {
                align: 'center',
                formatter: function () {
                    return `${this.value}`;
                },
            },
            title: {
                text: base,
            },
        },
        tooltip: {
            valueSuffix: ` ${base}`,
        },
        series: [
            {
                type: type,
                name: dataTitle,
                data: data.map((marketData) => +marketData[chartKey].toFixed(2)),
                dates,
                marker: {
                    radius: 2,
                    symbol: 'circle',
                },
                maxPointWidth: 30,
            },
        ],
        chart: {
            zoomType: 'x',
            height: 375,
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
                        [0, 'rgba(113, 171, 210, 0.11)'],
                        [
                            1,
                            color
                                ? (color('rgba(113, 171, 210, 0.11)').setOpacity(0).get('rgba') as string)
                                : '#71ABD2',
                        ],
                    ],
                },
                marker: {
                    radius: 2,
                },
                lineWidth: 2,
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
};
