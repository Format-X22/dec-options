import { gql, useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import format from 'date-fns/format';
import { TableContainer } from './TableContainer';
import { TablePart } from './TablePart';
import CallsIcon from '../CallsIcon';
import { TitleText } from './TitleText';
import PutsIcon from '../PutsIcon';
import { TableSide } from './TableSide';
import { StrikeColumn } from './StrikeColumn';
import { StrikeCell } from './StrikeCell';
import { EMarketType } from '@app/shared/market.schema';

const GET_STRIKES = gql`
    query getStrikes(
        $type: OptionType
        $base: String
        $marketType: MarketType
        $fromDate: DateTime
        $toDate: DateTime
    ) {
        strikes(type: $type, base: $base, marketType: $marketType, fromDate: $fromDate, toDate: $toDate) {
            strike
            markets {
                name
            }
            maxBid
            minAsk
        }
    }
`;

type Strike = {
    strike: number;
    markets: {
        name: string;
    }[];
    maxBid: number;
    minAsk: number;
};
type StrikeData = {
    strikes: Strike[];
};

export function Table({
    date,
    base,
    marketType,
}: {
    date: string;
    base: string;
    marketType?: EMarketType | '';
}): JSX.Element {
    const router = useRouter();

    const fromDate = new Date(date);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    const toDate = new Date(date);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    const { data: putsData, error: putsError } = useQuery<StrikeData>(GET_STRIKES, {
        variables: {
            type: 'PUT',
            base,
            marketType: marketType,
            fromDate: fromDate.toString(),
            toDate: toDate.toString(),
        },
    });

    const { data: callsData, error: callsError } = useQuery<StrikeData>(GET_STRIKES, {
        variables: {
            type: 'CALL',
            base,
            marketType: marketType,
            fromDate: fromDate.toString(),
            toDate: toDate.toString(),
        },
    });

    const dateString = format(new Date(date), 'dd MMMM');

    const strikes = [
        ...new Set([
            ...(callsData?.strikes || []).map(({ strike }) => strike),
            ...(putsData?.strikes || []).map(({ strike }) => strike),
        ]),
    ].sort((a, b) => (a > b ? 1 : -1));

    const callsDataByStrike: (Strike | undefined)[] = [];
    strikes.forEach((s) => {
        const data = (callsData?.strikes || []).find(({ strike }) => strike === s);
        callsDataByStrike.push(data);
    });

    const putsDataByStrike: (Strike | undefined)[] = [];
    strikes.map((s) => {
        const data = (putsData?.strikes || []).find(({ strike }) => strike === s);
        putsDataByStrike.push(data);
    });

    const onRowClick = useCallback(
        ({ strike, type }: { strike: number; type: string }): void => {
            router.push({
                pathname: `/trade`,
                query: {
                    date,
                    base,
                    strike,
                    type,
                },
            });
        },
        [date, base],
    );

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
                <TableSide
                    onRowClick={onRowClick}
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
                    <StrikeCell key={strike} active>
                        {+strike.toFixed(4)}
                    </StrikeCell>
                ))}
            </StrikeColumn>
            <TablePart reverse>
                <TableSide
                    onRowClick={onRowClick}
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
