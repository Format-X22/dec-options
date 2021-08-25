import React from 'react';
import { useRouter } from 'next/router';
import { useExpirations } from '../hooks/useExpirations';
import format from 'date-fns/format';
import Select from './Select';
import { CalendarIcon } from './Icons/CalendarIcon';

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(date));
};

export function DatesSelector(): JSX.Element {
    const router = useRouter();
    const value = (
        <>
            <CalendarIcon />
            {formatDate(router.query.date ? new Date(router.query.date as string) : new Date())}
        </>
    );

    const { parsedData } = useExpirations();
    const options = parsedData
        ? parsedData.map(({ expirationDate }) => ({
              name: formatDate(new Date(expirationDate)),
              value: format(new Date(expirationDate), 'yyyy/MM/dd'),
          }))
        : [];

    function onChange(newValue: string): void {
        router.query.date = newValue;
        router.push(router);
    }

    return <Select options={options} value={value} onChange={onChange} />;
}
