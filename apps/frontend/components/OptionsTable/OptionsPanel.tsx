import React from 'react';
import { GroupInfo } from './GroupInfo';
import { Table } from './Table';
import { OrderBook } from './OrderBook';
import styled from 'styled-components';

const PanelBodyWrap = styled.div`
    margin-top: 4px;
    display: flex;
    flex-direction: row;
    align-content: space-between;
    justify-content: center;

    & > div + div {
        margin-left: 5px;
    }
`;
const OrderBookWrap = styled.div`
    width: 33%;
    min-width: 400px;
`;

export function OptionsPanel(): JSX.Element {
    return (
        <>
            <GroupInfo />
            <PanelBodyWrap>
                <OrderBookWrap>
                    <OrderBook />
                </OrderBookWrap>
            </PanelBodyWrap>
        </>
    );
}
