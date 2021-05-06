import App, { AppProps, AppContext, AppInitialProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import 'antd/dist/antd.css';
import './index.css';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <>
            <Head>
                <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
                <title>Options aggregator</title>
                <link
                    rel='stylesheet'
                    href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
                />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

MyApp.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps> => {
    const appProps: AppInitialProps = await App.getInitialProps(appContext);

    return { ...appProps };
};

export default MyApp;
