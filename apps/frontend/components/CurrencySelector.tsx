import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { ContextApp } from '../pages/_app';
import Select from './Select';

export function CurrencySelector(): JSX.Element {
    const router = useRouter();
    const { state } = useContext(ContextApp);
    const bases = Object.keys(state.prices);
    const options = bases.map((base) => ({
        name: base,
        value: base,
    }));
    const value = state.filter.currency;

    function onChange(newValue: string): void {
        router.query.base = newValue;
        router.push(router);
    }

    return <Select options={options} value={value} onChange={onChange} label='Currency' />;
}
