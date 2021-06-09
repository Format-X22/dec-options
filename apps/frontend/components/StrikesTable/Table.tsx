import { gql, useQuery } from '@apollo/client';
import React from 'react';
import format from 'date-fns/format';
import { TableContainer } from './TableContainer';
import { TablePart } from './TablePart';
import CallsIcon from '../CallsIcon';
import { TitleText } from './TitleText';
import PutsIcon from '../PutsIcon';
import { TableSide } from './TableSide';
import { StrikeColumn } from './StrikeColumn';
import { StrikeCell } from './StrikeCell';

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

export function Table({ date, base }: { date: string; base: string }): JSX.Element {
    const fromDate = new Date(date);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    const toDate = new Date(date);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    const { data: putsData, error: putsError } = useQuery(GET_STRIKES, {
        variables: {
            type: 'PUT',
            base,
            fromDate: fromDate.toString(),
            toDate: toDate.toString(),
        },
    });

    const { data: callsData, error: callsError } = useQuery(GET_STRIKES, {
        variables: {
            type: 'CALL',
            base,
            fromDate: fromDate.toString(),
            toDate: toDate.toString(),
        },
    });

    const dateString = format(new Date(date), 'dd MMMM');

    const strikes = [
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
            <TablePart header>
                <CallsIcon />
            </TablePart>
            <TablePart header noTable>
                <TitleText>{dateString}</TitleText>
            </TablePart>
            <TablePart header reverse>
                <PutsIcon />
            </TablePart>
            <TablePart>
                <TableSide data={callsDataByStrike} error={callsError} type='call' date={fromDate} />
            </TablePart>
            <StrikeColumn>
                <StrikeCell>Strike</StrikeCell>
                {callsError && putsError && <StrikeCell>&nbsp;</StrikeCell>}
                {strikes.map((strike) => (
                    <StrikeCell key={strike} active>
                        {+strike.toFixed(4)}
                    </StrikeCell>
                ))}
            </StrikeColumn>
            <TablePart reverse>
                <TableSide data={putsDataByStrike} error={putsError} reverse type='put' date={fromDate} />
            </TablePart>
        </TableContainer>
    );
}
