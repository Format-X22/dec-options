import React from 'react';
import { useRouter } from 'next/router';
import format from 'date-fns/format';
import Select from './Select';
import { CalendarIcon } from './Icons/CalendarIcon';
import { gql, useQuery } from '@apollo/client';
import { OptionGQL } from '@app/shared/option.schema';
import { QueryResult } from '@apollo/client/react/types/types';

const GET_OPTIONS = gql`
    query getOptions($type: OptionType, $base: String!, $strike: Float!) {
        options(filterByType: $type, filterByBase: $base, filterByStrike: $strike) {
            data {
                id
                askQuote
                bidQuote
                expirationDate
            }
        }
    }
`;

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(date));
};

export function DatesSelector() {
    const router = useRouter();
    const value = (
        <>
            <CalendarIcon />
            {formatDate(router.query.date ? new Date(router.query.date as string) : new Date())}
        </>
    );

    const { data: optionGroupData, error: optionGroupError }: QueryResult<{ options: { data: Array<OptionGQL> } }> =
        useQuery(GET_OPTIONS, {
            variables: {
                type: ((router.query.type as string) || 'CALL').toUpperCase(),
                base: router.query.base || '',
                strike: +(router.query.strike || 0),
            },
        });
    const sortedData = optionGroupData ? [...optionGroupData.options.data] : [];
    const options = sortedData
        .filter(({ askQuote, bidQuote }) => askQuote !== 0 || bidQuote !== 0)
        .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
        .map(({ expirationDate }) => ({
            name: formatDate(new Date(expirationDate)),
            value: format(new Date(expirationDate), 'yyyy/MM/dd'),
        }))
        .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
    function onChange(newValue: string): void {
        router.query.date = newValue;
        router.push(router);
    }

    return !optionGroupError ? <Select options={options} value={value} onChange={onChange} /> : null;
}
