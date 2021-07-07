import { ContextState } from '../../pages/stateType';
import React, { useContext } from 'react';
import { ContextApp } from '../../pages/_app';
import { GreekValue } from '../../types';
import { differenceInDays } from 'date-fns';
import { TableRow } from './TableRow';
import { TableCell } from './TableCell';
import { TitleText } from './TitleText';
import { PrintGreek } from './PrintGreek';
import Bars from '../Bars';
import { Lines } from './Lines';
import greeks from 'greeks';
import iv from 'implied-volatility';
import { ApolloError } from '@apollo/client';

type TTableData = {
    strike?: number;
    minAsk?: number;
    maxBid?: number;
    askQuote?: number;
    bidQuote?: number;
    volatility?: number;
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
};

function checkGreek(value: number): GreekValue {
    return `${value}`.includes('e') ? null : value;
}

export function TableSide({
    data,
    error,
    reverse = false,
    type,
    date,
    onRowClick,
    hideSourcesColumn,
    showMarketColumn,
}: {
    data: any;
    error: ApolloError;
    reverse?: boolean;
    type: string;
    date: Date;
    onRowClick: (item: any) => void;
    hideSourcesColumn?: boolean;
    showMarketColumn?: boolean;
}): JSX.Element {
    const { state }: Partial<ContextState> = useContext(ContextApp);
    const currentPrice: number = state.prices[state.filter.currency] || 0;
    const [dataWithGreeks, setDataWithGreeks] = React.useState(null);

    function calcGreeks(): void {
        if (!data) {
            return;
        }

        const newData = data.map((item: TTableData): TTableData => {
            if (!item) {
                return item;
            }

            const elementData: TTableData = { ...item };
            let volatility: GreekValue = null;
            let delta: GreekValue = null;
            let gamma: GreekValue = null;
            let theta: GreekValue = null;
            let vega: GreekValue = null;
            let minAsk: number = item.minAsk || item.askQuote || 0;
            let maxBid: number = item.maxBid || item.bidQuote || 0;

            if (Number.isFinite(minAsk)) {
                minAsk = minAsk > currentPrice * 0.9 ? minAsk : minAsk * currentPrice;
                maxBid = maxBid > currentPrice * 0.9 ? maxBid : maxBid * currentPrice;

                const optionPrice = maxBid ? Math.abs(maxBid + minAsk) / 2 : minAsk;
                const strike = item.strike;
                const datesDifference = Math.abs(differenceInDays(new Date(date), new Date()) + 1) / 365;

                volatility = iv.getImpliedVolatility(optionPrice, currentPrice, strike, datesDifference, 0, type);

                const greeksArgs = [currentPrice, strike, datesDifference, volatility, 0, type];

                delta = greeks.getDelta(...greeksArgs);
                gamma = greeks.getGamma(...greeksArgs);
                theta = greeks.getTheta(...greeksArgs);
                vega = greeks.getVega(...greeksArgs);
            }

            elementData.volatility = checkGreek(volatility);
            elementData.delta = checkGreek(delta);
            elementData.gamma = checkGreek(gamma);
            elementData.theta = checkGreek(theta);
            elementData.vega = checkGreek(vega);
            elementData.maxBid = maxBid;
            elementData.minAsk = minAsk;

            return elementData;
        });

        setDataWithGreeks(newData);
    }

    React.useEffect((): void => {
        setDataWithGreeks(null);
        calcGreeks();
    }, [data]);

    React.useEffect((): void => {
        calcGreeks();
    }, [currentPrice]);

    return (
        <>
            <TableRow reverse={reverse}>
                {showMarketColumn && (
                    <TableCell>
                        <TitleText>Market</TitleText>
                    </TableCell>
                )}
                <TableCell data-name='param'>
                    <TitleText>IV</TitleText>
                </TableCell>
                <TableCell data-name='param'>
                    <TitleText>Delta</TitleText>
                </TableCell>
                <TableCell data-name='greek'>
                    <TitleText>Gamma</TitleText>
                </TableCell>
                <TableCell data-name='greek'>
                    <TitleText>Theta</TitleText>
                </TableCell>
                <TableCell data-name='greek'>
                    <TitleText>Vega</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Min Ask</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Max Bid</TitleText>
                </TableCell>
                {!hideSourcesColumn && (
                    <TableCell>
                        <TitleText>Sources</TitleText>
                    </TableCell>
                )}
            </TableRow>
            {error && <TableRow>{error.toString()}</TableRow>}
            {!error &&
                data &&
                (dataWithGreeks || data).map((item, j) =>
                    item ? (
                        <TableRow
                            reverse={reverse}
                            key={item.strike + j + Math.random()}
                            onClick={(): void => onRowClick(item)}
                            className='data-row'
                        >
                            {showMarketColumn && (
                                <TableCell>
                                    <TitleText>{item.market?.name}</TitleText>
                                </TableCell>
                            )}
                            <PrintGreek propKey='volatility' strikeData={item} name='param' />
                            <PrintGreek propKey='delta' strikeData={item} name='param' />
                            <PrintGreek propKey='gamma' strikeData={item} name='greek' />
                            <PrintGreek propKey='theta' strikeData={item} name='greek' />
                            <PrintGreek propKey='vega' strikeData={item} name='greek' />
                            <TableCell>
                                <TitleText active>
                                    {Number.isFinite(item.minAsk) ? item.minAsk.toFixed(2) : <Lines />}
                                </TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText active>
                                    {Number.isFinite(item.maxBid) ? item.maxBid.toFixed(2) : <Lines />}
                                </TitleText>
                            </TableCell>
                            {!hideSourcesColumn && (
                                <TableCell>
                                    <TitleText active>
                                        <Bars max={7} value={item.markets.length} align={reverse ? 'left' : 'right'} />
                                    </TitleText>
                                </TableCell>
                            )}
                        </TableRow>
                    ) : (
                        <TableRow reverse={reverse} key={j}>
                            {showMarketColumn && (
                                <TableCell>
                                    <TitleText>
                                        <Lines />
                                    </TitleText>
                                </TableCell>
                            )}
                            <TableCell data-name='param'>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            <TableCell data-name='param'>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            <TableCell data-name='greek'>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            <TableCell data-name='greek'>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            <TableCell data-name='greek'>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            {!hideSourcesColumn && (
                                <TableCell>
                                    <TitleText>
                                        <Bars max={7} value={0} align={reverse ? 'left' : 'right'} />
                                    </TitleText>
                                </TableCell>
                            )}
                        </TableRow>
                    ),
                )}
        </>
    );
}
