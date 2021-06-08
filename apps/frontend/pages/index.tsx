import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Filters from '../components/Filters';
import { ContextApp } from './_app';
import { ActionType, ContextState } from './stateType';
import StrikesTable from '../components/StrikesTable/StrikesTable';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100vw;
    min-height: 100vh;
`;

function Index(): JSX.Element {
    const { changeState }: Partial<ContextState> = useContext(ContextApp);

    async function loadPrices(): Promise<void> {
        const prices = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
        );
        const pricesList = await prices.json();
        if (pricesList.bitcoin && pricesList.bitcoin.usd) {
            changeState({
                type: ActionType.SET_PRICE,
                payload: {
                    key: 'BTC',
                    price: +pricesList.bitcoin.usd,
                },
            });
        }
        if (pricesList.ethereum && pricesList.ethereum.usd) {
            changeState({
                type: ActionType.SET_PRICE,
                payload: {
                    key: 'ETH',
                    price: +pricesList.ethereum.usd,
                },
            });
        }
    }

    useEffect((): (() => void) => {
        function loadNewPrices(): void {
            loadPrices()
                .then(function (): void {
                    console.log('new prices are loaded');
                })
                .catch(function (): void {
                    console.log('error while loading new prices');
                });
        }
        const interval = setInterval(loadNewPrices, 10000);

        return (): void => {
            clearInterval(interval);
        };
    }, []);

    return (
        <Container>
            <Header />
            <Filters />
            <StrikesTable />
        </Container>
    );
}

export default Index;
