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
import TableRowButton from './TableRowButton';
import { StrikeGroup } from '../../../../libs/shared/src/option.schema';

type TStrikeElementData = StrikeGroup & {
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
}: {
    data: any;
    error: ApolloError;
    reverse?: boolean;
    type: string;
    date: Date;
    onRowClick: () => void;
}): JSX.Element {
    const { state }: Partial<ContextState> = useContext(ContextApp);
    const currentPrice: number = state.prices[state.filter.currency] || 0;
    const [dataWithGreeks, setDataWithGreeks] = React.useState(null);

    function calcGreeks(): void {
        if (!data) {
            return;
        }

        const newData = data.map((strikeElement: StrikeGroup): TStrikeElementData => {
            if (!strikeElement) {
                return strikeElement;
            }

            const elementData: TStrikeElementData = { ...strikeElement };
            let volatility: GreekValue = null;
            let delta: GreekValue = null;
            let gamma: GreekValue = null;
            let theta: GreekValue = null;
            let vega: GreekValue = null;
            let minAsk: number = strikeElement.minAsk;
            let maxBid: number = strikeElement.maxBid;

            if (Number.isFinite(strikeElement.minAsk)) {
                minAsk = minAsk > currentPrice * 0.9 ? minAsk : minAsk * currentPrice;
                maxBid = maxBid > currentPrice * 0.9 ? maxBid : maxBid * currentPrice;

                const optionPrice = maxBid ? Math.abs(maxBid + minAsk) / 2 : minAsk;
                const strike = strikeElement.strike;
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
                <TableCell>
                    <TitleText>Sources</TitleText>
                </TableCell>
            </TableRow>
            {error && <TableRow>{error.toString()}</TableRow>}
            {!error &&
                data &&
                (dataWithGreeks || data).map((strike, j) =>
                    strike ? (
                        <TableRow reverse={reverse} key={strike.strike + j} onClick={onRowClick} className='data-row'>
                            <PrintGreek propKey='volatility' strikeData={strike} name='param' />
                            <PrintGreek propKey='delta' strikeData={strike} name='param' />
                            <PrintGreek propKey='gamma' strikeData={strike} name='greek' />
                            <PrintGreek propKey='theta' strikeData={strike} name='greek' />
                            <PrintGreek propKey='vega' strikeData={strike} name='greek' />
                            <TableCell>
                                <TitleText active>
                                    {Number.isFinite(strike.minAsk) ? strike.minAsk.toFixed(2) : <Lines />}
                                </TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText active>
                                    {Number.isFinite(strike.maxBid) ? strike.maxBid.toFixed(2) : <Lines />}
                                </TitleText>
                            </TableCell>
                            <TableCell>
                                <TitleText active>
                                    <Bars max={7} value={strike.markets.length} align={reverse ? 'left' : 'right'} />
                                </TitleText>
                            </TableCell>
                        </TableRow>
                    ) : (
                        <TableRow reverse={reverse} key={j}>
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
