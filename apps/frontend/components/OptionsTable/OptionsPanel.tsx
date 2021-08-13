import React from 'react';
import { GroupInfo } from './GroupInfo';
import { OrderBook } from './OrderBook';
import styled from 'styled-components';
import Trade from './Trade';

const PanelBodyWrap = styled.div`
    padding: 24px;
    display: flex;
    flex-direction: row;
    align-content: space-between;
    justify-content: flex-start;
    flex: 100;
    background: #303030;

    & > div + div {
        margin-left: 5px;
        width: 100%;
        overflow-y: auto;

        &::-webkit-scrollbar-thumb {
            background: transparent;
        }
        &::-webkit-scrollbar {
            padding: 2px;
            width: 12px;
            height: 12px;
            background: #000000;
        }
        &:hover::-webkit-scrollbar-thumb {
            background: #303030;
            border-radius: 12px;
            border: 2px solid transparent;
            background-clip: content-box;
        }
    }
`;
const OrderBookWrap = styled.div`
    width: 450px;
    display: flex;
    flex-direction: column;

    @media screen and (max-width: 576px) {
        width: 100%;
    }
`;

export function OptionsPanel(): JSX.Element {
    return (
        <>
            <GroupInfo />
            <PanelBodyWrap>
                <OrderBookWrap>
                    <OrderBook />
                </OrderBookWrap>
                <Trade />
            </PanelBodyWrap>
        </>
    );
}
