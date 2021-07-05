import React, { useContext } from 'react';
import { TableSide } from '../StrikesTable/TableSide';
import { ContextState } from '../../pages/stateType';
import { ContextApp } from '../../pages/_app';
import { gql, useQuery } from '@apollo/client';

const GET_OPTIONS = gql`
    query getOptions($type: OptionType, $base: String!, $fromDate: DateTime, $toDate: DateTime, $strike: Float!) {
        options(
            filterByType: $type
            filterByBase: $base
            filterByDateFrom: $fromDate
            filterByDateTo: $toDate
            filterByStrike: $strike
        ) {
            data {
                strike
                askQuote
                bidQuote
            }
        }
    }
`;

export function Table(): JSX.Element {
    // TODO -
    const { state }: Partial<ContextState> = useContext(ContextApp);

    const fromDate = new Date(state.selectedOption?.date || 0);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);

    const toDate = new Date(state.selectedOption?.date || 0);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    console.log(
        useQuery(GET_OPTIONS, {
            variables: {
                type: state.selectedOption?.type.toUpperCase() || 'CALL',
                base: state.selectedOption?.base || '',
                strike: state.selectedOption?.strike || 0,
                fromDate,
                toDate,
            },
        }),
    );

    return (
        <TableSide
            data={[]} // TODO -
            error={null} // TODO -
            type={state.selectedOption?.type}
            date={state.selectedOption?.date}
            onRowClick={(): void => console.log('INSIDE ROW')} // TODO -
            hideSourcesColumn={true}
        />
    );
}
