import React, { useContext } from 'react';
import { TableSide } from '../StrikesTable/TableSide';
import { ContextState } from '../../pages/stateType';
import { ContextApp } from '../../pages/_app';
import { gql, useQuery } from '@apollo/client';
import { Option } from '../../../../libs/shared/src/option.schema';
import { QueryResult } from '@apollo/client/react/types/types';

const GET_OPTIONS = gql`
    query getOptions(
        $type: OptionType
        $base: String!
        $fromExpirationDate: DateTime
        $toExpirationDate: DateTime
        $strike: Float!
    ) {
        options(
            filterByType: $type
            filterByBase: $base
            filterByExpirationDateFrom: $fromExpirationDate
            filterByExpirationDateTo: $toExpirationDate
            filterByStrike: $strike
        ) {
            data {
                strike
                askQuote
                bidQuote
                market {
                    name
                }
            }
        }
    }
`;

export function Table(): JSX.Element {
    const { state }: Partial<ContextState> = useContext(ContextApp);

    const fromExpirationDate = new Date(state.selectedOption?.date || 0);

    fromExpirationDate.setHours(0);
    fromExpirationDate.setMinutes(0);
    fromExpirationDate.setSeconds(0);

    const toExpirationDate = new Date(state.selectedOption?.date || 0);

    toExpirationDate.setHours(23);
    toExpirationDate.setMinutes(59);
    toExpirationDate.setSeconds(59);

    const { data, error }: QueryResult<{ options: { data: Array<Option> } }> = useQuery(GET_OPTIONS, {
        variables: {
            type: state.selectedOption?.type.toUpperCase() || 'CALL',
            base: state.selectedOption?.base || '',
            strike: state.selectedOption?.strike || 0,
            fromExpirationDate,
            toExpirationDate,
        },
    });

    return (
        <TableSide
            data={data?.options.data}
            error={error}
            type={state.selectedOption?.type}
            date={state.selectedOption?.date}
            onRowClick={(): void => console.log('INSIDE ROW')} // TODO -
            hideSourcesColumn={true}
            showMarketColumn={true}
        />
    );
}
