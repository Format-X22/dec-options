import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { Dispatch, useReducer } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import 'antd/dist/antd.css';
import './index.scss';

import 'swiper/swiper.scss';
import { Action, ContextState, State } from './stateType';
import { rootReducer } from '../reducers/rootReducer';

const client = new ApolloClient({ uri: '/graphql', cache: new InMemoryCache() });

export const initialState: State = {
    filter: {
        date: '',
        currency: 'ETH',
    },
    prices: {},
};

export const ContextApp = React.createContext<Partial<ContextState>>({});

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const [state, changeState]: [State, Dispatch<Action>] = useReducer<React.Reducer<State, Action>>(
        rootReducer,
        initialState,
    );

    const contextState: ContextState = {
        state,
        changeState,
    };

    return (
        <>
            <Head>
                <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
                <title>Options aggregator</title>
                <link
                    href='https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap'
                    rel='stylesheet'
                />
            </Head>
            <ContextApp.Provider value={contextState}>
                <ApolloProvider client={client}>
                    <Component {...pageProps} />
                </ApolloProvider>
            </ContextApp.Provider>
        </>
    );
}

MyApp.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps> => {
    const appProps: AppInitialProps = await App.getInitialProps(appContext);

    return { ...appProps };
};

export default dynamic(() => Promise.resolve(MyApp), {
    ssr: false,
});
