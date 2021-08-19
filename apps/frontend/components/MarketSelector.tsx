import { useRouter } from 'next/router';
import { useContext } from 'react';
import { ContextApp } from '../pages/_app';
import Select from './Select';

export function MarketSelector(): JSX.Element {
    const router = useRouter();
    const { state } = useContext(ContextApp);
    const options = ['ALL', 'DEX', 'CEX'].map((marketType) => ({
        name: marketType,
        value: marketType,
    }));
    const value = state.filter.marketType || 'ALL';

    function onChange(newValue: string): void {
        if (newValue === 'ALL') {
            delete router.query.marketType;
        } else {
            router.query.marketType = newValue;
        }
        router.push(router);
    }

    return <Select options={options} value={value} onChange={onChange} label='Market type' />;
}
