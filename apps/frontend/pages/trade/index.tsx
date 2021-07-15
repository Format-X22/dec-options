import React from 'react';
import Layout from '../../components/Layout/Layout';
import { OptionsPanel } from '../../components/OptionsTable/OptionsPanel';

const Index = () => {
    return (
        <Layout>
            <OptionsPanel />
        </Layout>
    );
};

export async function getServerSideProps(context) {
    return {
        props: {},
    };
}

export default Index;
