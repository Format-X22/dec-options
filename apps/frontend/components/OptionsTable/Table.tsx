import React, { useContext } from 'react';
import { TableSide } from '../StrikesTable/TableSide';
import { ActionType, ContextState } from '../../pages/stateType';
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
                id
                strike
                askQuote
                bidQuote
                market {
                    key
                    name
                }
            }
        }
    }
`;

export function Table(): JSX.Element {
    const { state, changeState }: Partial<ContextState> = useContext(ContextApp);

    const fromExpirationDate = new Date(state.selectedOptionGroup?.date || 0);

    fromExpirationDate.setHours(0);
    fromExpirationDate.setMinutes(0);
    fromExpirationDate.setSeconds(0);

    const toExpirationDate = new Date(state.selectedOptionGroup?.date || 0);

    toExpirationDate.setHours(23);
    toExpirationDate.setMinutes(59);
    toExpirationDate.setSeconds(59);

    const { data, error }: QueryResult<{ options: { data: Array<Option> } }> = useQuery(GET_OPTIONS, {
        variables: {
            type: state.selectedOptionGroup?.type.toUpperCase() || 'CALL',
            base: state.selectedOptionGroup?.base || '',
            strike: state.selectedOptionGroup?.strike || 0,
            fromExpirationDate,
            toExpirationDate,
        },
    });

    return (
        <TableSide
            data={data?.options.data}
            error={error}
            type={state.selectedOptionGroup?.type}
            date={state.selectedOptionGroup?.date}
            onRowClick={(item: Option): void =>
                changeState({
                    type: ActionType.SET_SELECTED_OPTION_FOR_ORDER_BOOK,
                    payload: {
                        optionMarketKey: item.marketKey,
                        optionId: item.id,
                    },
                })
            }
            hideSourcesColumn={true}
            showMarketColumn={true}
        />
    );
}
