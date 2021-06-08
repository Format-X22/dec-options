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

export function TableSide({
    data,
    error,
    reverse = false,
    type,
    date,
}: {
    data: any;
    error: ApolloError;
    reverse?: boolean;
    type: string;
    date: Date;
}): JSX.Element {
    const { state }: Partial<ContextState> = useContext(ContextApp);
    const currentPrice: number = state.prices[state.filter.currency] || 0;
    const [dataWithGreeks, setDataWithGreeks] = React.useState(null);

    function calcGreeks(): void {
        if (data) {
            const newData = data.map((strikeElement) => {
                if (strikeElement) {
                    const obj = { ...strikeElement };
                    let volatility: GreekValue = null;
                    let delta: GreekValue = null;
                    let gamma: GreekValue = null;
                    let theta: GreekValue = null;
                    let vega: GreekValue = null;
                    if (strikeElement.minAsk) {
                        const optionPrice =
                            currentPrice *
                            (strikeElement.maxBid
                                ? Math.abs(strikeElement.maxBid + strikeElement.minAsk) / 2
                                : strikeElement.minAsk);
                        const strike = strikeElement.strike;
                        const datesDifference = Math.abs(differenceInDays(new Date(date), new Date()) + 1) / 365;
                        volatility = iv.getImpliedVolatility(
                            optionPrice,
                            currentPrice,
                            strike,
                            datesDifference,
                            0,
                            type,
                        );
                        delta = greeks.getDelta(currentPrice, strike, datesDifference, volatility, 0, type);
                        gamma = greeks.getGamma(currentPrice, strike, datesDifference, volatility, 0, type);
                        theta = greeks.getTheta(currentPrice, strike, datesDifference, volatility, 0, type);
                        vega = greeks.getVega(currentPrice, strike, datesDifference, volatility, 0, type);
                    }
                    obj.volatility = volatility;
                    obj.delta = delta;
                    obj.gamma = gamma;
                    obj.theta = theta;
                    obj.vega = vega;
                    return obj;
                }
                return strikeElement;
            });
            setDataWithGreeks(newData);
        }
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
                <TableCell>
                    <TitleText>IV</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Delta</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Gamma</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Theta</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Vega</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Min Ask</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Max Bid</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText>Sources</TitleText>
                </TableCell>
            </TableRow>
            {error && <TableRow>{error.toString()}</TableRow>}
            {!error &&
                data &&
                (dataWithGreeks || data).map((strike, j) =>
                    strike ? (
                        <TableRow reverse={reverse} key={strike.strike + j}>
                            <PrintGreek propKey='volatility' strikeData={strike} />
                            <PrintGreek propKey='delta' strikeData={strike} />
                            <PrintGreek propKey='gamma' strikeData={strike} />
                            <PrintGreek propKey='theta' strikeData={strike} />
                            <PrintGreek propKey='vega' strikeData={strike} />
                            <TableCell>
                                <TitleText active>{(strike.minAsk * currentPrice || 0).toFixed(4)}</TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText active>{(strike.maxBid * currentPrice || 0).toFixed(4)}</TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText active>
                                    <Bars max={7} value={strike.markets.length} align={reverse ? 'left' : 'right'} />
                                </TitleText>
                            </TableCell>
                        </TableRow>
                    ) : (
                        <TableRow reverse={reverse} key={j}>
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
                            <TableCell>
                                <TitleText>
                                    <Lines />
                                </TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText>
                                    <Bars max={7} value={0} align={reverse ? 'left' : 'right'} />
                                </TitleText>
                            </TableCell>
                        </TableRow>
                    ),
                )}
        </>
    );
}
