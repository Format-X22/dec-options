import React from 'react';
import { GroupInfo } from './GroupInfo';
import { OrderBook } from './OrderBook';
import styled from 'styled-components';

const PanelBodyWrap = styled.div`
    margin-top: 4px;
    display: flex;
    flex-direction: row;
    align-content: space-between;
    justify-content: flex-start;
    overflow: hidden;

    & > div + div {
        margin-left: 5px;
    }
`;
const OrderBookWrap = styled.div`
    width: 50%;

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
            </PanelBodyWrap>
        </>
    );
}
