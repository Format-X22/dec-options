import { useContext, useState, useEffect } from 'react';
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

export type TTableData = {
    strike: number;
    markets?: { name: string }[];
    // TODO probably never used
    market?: { name: string };
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

function checkGreek(value: GreekValue): GreekValue {
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
    data: (TTableData | undefined)[];
    error?: ApolloError;
    reverse?: boolean;
    type: string;
    date: Date;
    onRowClick: ({ strike, type }: { strike: number; type: string }) => void;
    hideSourcesColumn?: boolean;
    showMarketColumn?: boolean;
}): JSX.Element {
    const { state } = useContext(ContextApp);
    const currentPrice: number = state.prices[state.filter.currency] || 0;
    const [dataWithGreeks, setDataWithGreeks] = useState<(TTableData | undefined)[]>([]);

    function calcGreeks(): void {
        if (!data) {
            return;
        }

        const newData = data.map((item) => {
            if (!item) {
                return;
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

            elementData.volatility = checkGreek(volatility) || undefined;
            elementData.delta = checkGreek(delta) || undefined;
            elementData.gamma = checkGreek(gamma) || undefined;
            elementData.theta = checkGreek(theta) || undefined;
            elementData.vega = checkGreek(vega) || undefined;
            elementData.maxBid = maxBid;
            elementData.minAsk = minAsk;

            return elementData;
        });

        setDataWithGreeks(newData);
    }

    useEffect((): void => {
        setDataWithGreeks([]);
        calcGreeks();
    }, [data]);

    useEffect((): void => {
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
                            onClick={(): void => onRowClick({ strike: item.strike, type })}
                            className='data-row'
                        >
                            {showMarketColumn && (
                                <TableCell>
                                    <TitleText>{item.market?.name}</TitleText>
                                </TableCell>
                            )}
                            <PrintGreek value={item.volatility} name='param' />
                            <PrintGreek value={item.delta} name='param' />
                            <PrintGreek value={item.gamma} name='greek' />
                            <PrintGreek value={item.theta} name='greek' />
                            <PrintGreek value={item.vega} name='greek' />
                            <TableCell>
                                <TitleText active>
                                    {item.minAsk && Number.isFinite(item.minAsk) ? item.minAsk.toFixed(2) : <Lines />}
                                </TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText active>
                                    {item.maxBid && Number.isFinite(item.maxBid) ? item.maxBid.toFixed(2) : <Lines />}
                                </TitleText>
                            </TableCell>
                            {item.markets && !hideSourcesColumn && (
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
