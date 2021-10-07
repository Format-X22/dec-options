import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Dispatch, useReducer, createContext, Reducer } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import 'antd/dist/antd.css';
import './index.scss';

import 'swiper/swiper.scss';
import { Action, ContextState, State } from '../types/stateType';
import { rootReducer } from '../reducers/rootReducer';

export const client = new ApolloClient({ uri: '/graphql', cache: new InMemoryCache() });

export const initialState: State = {
    filter: {
        date: '',
        currency: 'ETH',
    },
    prices: {
        ETH: 0,
    },
};

export const ContextApp = createContext<ContextState>({
    state: initialState,
    changeState: () => undefined,
});

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const [state, changeState]: [State, Dispatch<Action>] = useReducer<Reducer<State, Action>>(
        rootReducer,
        initialState,
    );

    const contextState: ContextState = {
        state,
        changeState,
    };

    const { metaTags } = pageProps;

    return (
        <>
            <Head>
                <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
                <title>DeCommas Opex</title>
                {metaTags &&
                    Object.keys(metaTags).map((tagName) => (
                        <meta key={`meta-tag-${tagName}`} property={tagName} content={metaTags[tagName]} />
                    ))}
                <link rel='icon' href='/opex/public/opex.svg' />
                <link
                    href='https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap'
                    rel='stylesheet'
                />
                <script async src='https://www.googletagmanager.com/gtag/js?id=G-0PTR8ERRMJ' />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-0PTR8ERRMJ', { page_path: window.location.pathname });
                      `,
                    }}
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

export default dynamic(() => Promise.resolve(MyApp), {
    ssr: true,
});
