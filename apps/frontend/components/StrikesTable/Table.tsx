import { gql, useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import format from 'date-fns/format';
import { TableContainer } from './TableContainer';
import { TablePart } from './TablePart';
import CallsIcon from '../CallsIcon';
import { TitleText } from './TitleText';
import PutsIcon from '../PutsIcon';
import { OrderBookInfo, TableSide } from './TableSide';
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
            orderBookInfo {
                asksCount
                bidsCount
            }
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
    orderBookInfo: OrderBookInfo[];
    barsWeight: number;
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

export const calculateBarsWeight = (orderBookInfo: OrderBookInfo[]) => {
    return (
        orderBookInfo.reduce((acc, { asksCount, bidsCount }) => asksCount + bidsCount + acc, 0) *
        orderBookInfo.length *
        0.75
    );
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
        let data = (callsData?.strikes || []).find(({ strike }) => strike === s);
        if (data) {
            data = { ...data, barsWeight: calculateBarsWeight(data.orderBookInfo) };
        }
        callsDataByStrike.push(data);
    });

    const putsDataByStrike: (Strike | undefined)[] = [];
    strikes.map((s) => {
        let data = (putsData?.strikes || []).find(({ strike }) => strike === s);
        if (data) {
            data = { ...data, barsWeight: calculateBarsWeight(data.orderBookInfo) };
        }
        putsDataByStrike.push(data);
    });

    const maxBarsWeight = useMemo(
        () =>
            [...callsDataByStrike, ...putsDataByStrike]
                .filter((item) => item)
                // @ts-ignore
                .reduce((max, { barsWeight }) => (barsWeight > max ? barsWeight : max), 0),
        [callsDataByStrike, putsDataByStrike],
    );

    const onRowClick = useCallback(
        ({ strike, type }: { strike: number; type: string }): void => {
            const query: { date: string; base: string; strike: number; type: string; marketType?: string } = {
                date,
                base,
                strike,
                type,
            };
            if (router.query.marketType) {
                query.marketType = router.query.marketType as string;
            }
            router.push({
                pathname: `/trade`,
                query: query,
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
                    maxBarsWeight={maxBarsWeight}
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
                    maxBarsWeight={maxBarsWeight}
                />
            </TablePart>
        </TableContainer>
    );
}
