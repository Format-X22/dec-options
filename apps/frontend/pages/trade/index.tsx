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

export async function getServerSideProps() {
  return {
    props: {}
  }
}

export default Index;