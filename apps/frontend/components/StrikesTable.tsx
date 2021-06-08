import React, { useContext } from 'react';
import styled from 'styled-components';
import { $backgroundDark, $backgroundLight, $lineColor, $tableTitleBackground } from '../theme';
import { ContextApp } from '../pages/_app';
import format from 'date-fns/format';
import { gql, useQuery } from '@apollo/client';
import iv from 'implied-volatility';
import greeks from 'greeks';
import Bars from './Bars';
import CallsIcon from './CallsIcon';
import PutsIcon from './PutsIcon';
import { differenceInDays } from 'date-fns';
import { ContextState } from '../pages/stateType';

// (window as any).getImpliedVolatility = iv.getImpliedVolatility;
// (window as any).getDelta = greeks.getDelta;

const StyledContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    max-height: 100vh;
`;

const TableContainer = styled.div`
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 104px 1fr;
    grid-template-rows: 68px auto;
    row-gap: 1px;
`;

const TablePart = styled.div`
    display: flex;
    flex-direction: ${({ row }) => (row ? 'row' : 'column')};
    width: 100%;
    height: 100%;
    background: ${$backgroundLight};
    ${({ noTable }) => noTable && `padding: 24px 0`};
    ${({ reverse }) => reverse && 'align-items: flex-end;'}
`;

const TableRow = styled.div`
    display: flex;
    width: 100%;
    height: 48px;
    background: ${$backgroundLight};
    align-items: center;
    justify-content: center;
    flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};

    & + & {
        border-top: 1px solid ${$lineColor};
    }
`;

const TableCell = styled.div`
    width: calc(100% / 8);
    padding: 16px 0;
`;

const StrikeColumn = styled.div`
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
`;

const StrikeCell = styled.div`
    background: ${$backgroundDark};
    width: 100%;
    height: 48px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    padding: 16px 0;
    color: ${({ active }) => (active ? '#fff' : $tableTitleBackground)};
    & + & {
        border-top: 1px solid ${$lineColor};
    }
`;

const TitleText = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ active }) => (active ? '#fff' : $tableTitleBackground)};
`;

function Lines(): JSX.Element {
    return (
        <svg width='17' height='2' viewBox='0 0 17 2' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
                d='M0.0580863 1.031H5.93809V0.149H0.0580863V1.031ZM11.0614 1.031H16.9414V0.149H11.0614V1.031Z'
                fill='#434343'
            />
        </svg>
    );
}

const GET_STRIKES = gql`
    query getStrikes($type: OptionType, $base: String, $fromDate: DateTime, $toDate: DateTime) {
        strikes(type: $type, base: $base, fromDate: $fromDate, toDate: $toDate) {
            strike
            markets {
                name
            }
            maxBid
            minAsk
        }
    }
`;

type Greek = number | null;

function PrintGreek({ strikeData, propKey }): JSX.Element {
    return (
        <TableCell>
            <TitleText>
                {strikeData[propKey] ? (
                    strikeData[propKey].toFixed(4)
                ) : (
                    <TitleText>
                        <Lines />
                    </TitleText>
                )}
            </TitleText>
        </TableCell>
    );
}

function TableSide({ data, error, reverse = false, type, date }): JSX.Element {
    const { state }: Partial<ContextState> = useContext(ContextApp);
    const currentPrice: number = state.prices[state.filter.currency] || 0;
    const [dataWithGreeks, setDataWithGreeks] = React.useState(null);

    function calcGreeks(): void {
        if (data) {
            const newData = data.map((strikeElement, i) => {
                if (strikeElement) {
                    const obj = { ...strikeElement };
                    let volatility: Greek = null;
                    let delta: Greek = null;
                    let gamma: Greek = null;
                    let theta: Greek = null;
                    let vega: Greek = null;
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

function Table({ date, base }: { date: string; base: string }): JSX.Element {
    const [loadingTimeout, setLoadingTimeout] = React.useState(true);
    const fromDate = new Date(date);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    const toDate = new Date(date);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    const {
        loading: putsLoading,
        data: putsData,
        error: putsError,
    } = useQuery(GET_STRIKES, {
        variables: {
            type: 'PUT',
            base,
            fromDate: fromDate.toString(),
            toDate: toDate.toString(),
        },
    });

    const {
        loading: callsLoading,
        data: callsData,
        error: callsError,
    } = useQuery(GET_STRIKES, {
        variables: {
            type: 'CALL',
            base,
            fromDate: fromDate.toString(),
            toDate: toDate.toString(),
        },
    });

    const dateString = format(new Date(date), 'dd MMMM');

    React.useEffect((): void => {
        setLoadingTimeout(true);
        setTimeout((): void => {
            setLoadingTimeout(false);
        }, 1000);
    }, [date, base]);

    React.useEffect((): void => {
        setTimeout((): void => {
            setLoadingTimeout(false);
        }, 1000);
    }, []);

    const strikes = [
        ...new Set([
            ...(callsData?.strikes || []).map(({ strike }) => strike),
            ...(putsData?.strikes || []).map(({ strike }) => strike),
        ]),
    ].sort((a, b) => (a > b ? 1 : -1));

    const callsDataByStrike = strikes.map((s) => {
        const data = (callsData?.strikes || []).find(({ strike }) => strike === s);
        return data || null;
    });

    const putsDataByStrike = strikes.map((s) => {
        const data = (putsData?.strikes || []).find(({ strike }) => strike === s);
        return data || null;
    });

    return (
        <TableContainer>
            <TablePart>
                <CallsIcon />
            </TablePart>
            <TablePart noTable>
                <TitleText>{dateString}</TitleText>
            </TablePart>
            <TablePart reverse>
                <PutsIcon />
            </TablePart>
            <TablePart>
                <TableSide
                    loading={callsLoading || loadingTimeout}
                    data={callsDataByStrike}
                    error={callsError}
                    type='call'
                    date={fromDate}
                />
            </TablePart>
            <StrikeColumn>
                <StrikeCell>Strike</StrikeCell>
                {callsError && putsError && <StrikeCell>&nbsp;</StrikeCell>}
                {strikes.map((strike) => (
                    <StrikeCell active>{+strike.toFixed(4)}</StrikeCell>
                ))}
            </StrikeColumn>
            <TablePart>
                <TableSide
                    loading={putsLoading || loadingTimeout}
                    data={putsDataByStrike}
                    error={putsError}
                    reverse
                    type='put'
                    date={fromDate}
                />
            </TablePart>
        </TableContainer>
    );
}

function StrikesTable(): JSX.Element {
    const { state, changeState } = useContext(ContextApp);

    React.useEffect(() => {}, [state.filter.currency, state.filter.date]);

    return (
        <StyledContainer>
            {state.filter.currency && state.filter.date && (
                <Table base={state.filter.currency} date={state.filter.date} />
            )}
        </StyledContainer>
    );
}

export default StrikesTable;
