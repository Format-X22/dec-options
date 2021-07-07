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

    & > div + div {
        margin-left: 5px;
    }
`;
const TableWrap = styled.div`
    flex: 2;
`;
const OrderBookWrap = styled.div`
    flex: 1;
`;

export function OptionsPanel(): JSX.Element {
    return (
        <>
            <GroupInfo />
            <PanelBodyWrap>
                <TableWrap>
                    <Table />
                </TableWrap>

                <OrderBookWrap>
                    <OrderBook />
                </OrderBookWrap>
            </PanelBodyWrap>
        </>
    );
}
