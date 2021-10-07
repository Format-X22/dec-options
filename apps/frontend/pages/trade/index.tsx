import React from 'react';
import Layout from '../../components/Layout/Layout';
import { OptionsPanel } from '../../components/OptionsTable/OptionsPanel';

const Index = () => {
    return (
        <Layout fixedScreenHeight={true}>
            <OptionsPanel />
        </Layout>
    );
};

export async function getServerSideProps({ query }) {
    const queryString = Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
    const metaTags = {
        'og:title': `DeCommas Opex Trade`,
        'og:description': `Take a look at all available options for ${query['base']} ${query['strike']} ${query['type']} strike`,
        'og:image': 'https://decommas.io/opex/public/opex.svg',
        'og:url': `https://decommas.io/opex/trade?${queryString}`,
    };
    return {
        props: {
            query,
            metaTags,
        },
    };
}

export default Index;
