import React from 'react';
import { GroupInfo } from './GroupInfo';
import { Table } from './Table';
import { OrderBook } from './OrderBook';
import styled from 'styled-components';

const PanelBodyWrap = styled.div`
    margin-top: 4px;
    display: flex;
    flex-direction: row;
`;
const ColumnWrap = styled.div`
    flex: 1;
`;

export function OptionsPanel(): JSX.Element {
    return (
        <>
            <GroupInfo />
            <PanelBodyWrap>
                <ColumnWrap>
                    <Table />
                </ColumnWrap>
                <ColumnWrap>
                    <OrderBook />
                </ColumnWrap>
            </PanelBodyWrap>
        </>
    );
}
