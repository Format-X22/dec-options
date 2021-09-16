import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Filters from '../components/Filters';
import { ContextApp } from './_app';
import { ActionType, ContextState } from '../types/stateType';
import StrikesTable from '../components/StrikesTable/StrikesTable';
import { gql, useQuery } from '@apollo/client';
import Layout from '../components/Layout/Layout';
import TableCharts from '../components/TableCharts/TableCharts';

const GET_BASES = gql`
    query getBases {
        bases {
            symbol
        }
    }
`;

const GET_PRICES = gql`
    query getBases {
        bases {
            usdPrice
            symbol
        }
    }
`;

function Index(): JSX.Element {
    const router = useRouter();
    const { base = 'ETH', date, marketType } = router.query;
    const { changeState }: Partial<ContextState> = useContext(ContextApp);

    useEffect(() => {
        if (base && typeof base === 'string') {
            changeState({ type: ActionType.SET_FILTER_CURRENCY, payload: base });
        }
    }, [base]);

    useEffect(() => {
        if (date && typeof date === 'string') {
            changeState({ type: ActionType.SET_FILTER_DATE, payload: date });
        }
    }, [date]);

    useEffect(() => {
        changeState({ type: ActionType.SET_FILTER_MARKET_TYPE, payload: marketType as string });
    }, [marketType]);

    // TODO add error handling
    const { loading: loadingBases, data: dataBases } = useQuery(GET_BASES);
    const { loading: loadingPrices, data: dataPrices, refetch } = useQuery(GET_PRICES);

    useEffect(() => {
        if (!loadingBases && dataBases?.bases) {
            const payload = dataBases.bases.reduce((acc, value) => {
                acc[value['symbol']] = 0;
                return acc;
            }, {});

            changeState({
                type: ActionType.SET_PRICES,
                payload,
            });
        }
    }, [loadingBases]);

    useEffect(() => {
        if (!loadingPrices && dataPrices?.bases) {
            const payload = dataPrices.bases.reduce((acc, value) => {
                acc[value['symbol']] = value['usdPrice'];
                return acc;
            }, {});

            changeState({
                type: ActionType.SET_PRICES,
                payload,
            });
        }
    }, [dataPrices?.bases]);

    useEffect(() => {
        setInterval(() => {
            refetch();
        }, 10000);
    }, []);

    return (
        <Layout>
            <Filters />
            {marketType !== 'DEX' && <TableCharts />}
            <StrikesTable />
        </Layout>
    );
}

export default Index;
