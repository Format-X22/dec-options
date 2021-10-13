import { gql, QueryResult, useQuery } from '@apollo/client';
import { OptionGQL } from '@app/shared/option.schema';

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
                marketUrl
                market {
                    key
                    name
                }
                fees {
                    takerPercent
                    takerTransactionUsd
                }
            }
        }
    }
`;

export const useOptions = (
    type: string,
    base: string,
    strike: string,
    fromExpirationDate: Date,
    toExpirationDate: Date,
) => {
    const { data: optionGroupData, error: optionGroupError }: QueryResult<{ options: { data: Array<OptionGQL> } }> =
        useQuery(GET_OPTIONS, {
            variables: {
                type: type?.toUpperCase() || 'CALL',
                base: base || '',
                strike: +strike || 0,
                fromExpirationDate,
                toExpirationDate,
            },
        });

    return { optionGroupData, optionGroupError };
};
