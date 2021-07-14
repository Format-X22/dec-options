import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Filters from '../components/Filters';
import { ContextApp } from './_app';
import { ActionType, ContextState, ESplashPanels } from './stateType';
import StrikesTable from '../components/StrikesTable/StrikesTable';
import { gql, useQuery } from '@apollo/client';
import Layout from '../components/Layout/Layout';


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

function Index(props): JSX.Element {
    const router = useRouter();
    const { base = 'ETH', date } = router.query;
    const { state, changeState }: Partial<ContextState> = useContext(ContextApp);

    React.useEffect(() => {
        if (base && typeof base === 'string') {
            changeState({ type: ActionType.SET_FILTER_CURRENCY, payload: base });
        }
    }, [base]);

    React.useEffect(() => {
        if (date && typeof date === 'string') {
            changeState({ type: ActionType.SET_FILTER_DATE, payload: date });
        }
    }, [date]);

    const { loading: loadingBases, data: dataBases, error: errorBases } = useQuery(GET_BASES);
    const { loading: loadingPrices, data: dataPrices, error: errorPrices, refetch } = useQuery(GET_PRICES);

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
        <StrikesTable />
      </Layout>
    );
}

export default Index;
