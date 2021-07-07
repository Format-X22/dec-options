import React, { useContext } from 'react';
import { TableRow } from '../StrikesTable/TableRow';
import { TableCell } from '../StrikesTable/TableCell';
import { TitleText } from '../StrikesTable/TitleText';
import { gql, useQuery } from '@apollo/client';
import { OrderBook as OrderBookModel, OrderBookOrder } from '../../../../libs/shared/src/orderbook.schema';
import { QueryResult } from '@apollo/client/react/types/types';
import { ContextState } from '../../pages/stateType';
import { ContextApp } from '../../pages/_app';
import styled from 'styled-components';

const GET_ORDER_BOOK = gql`
    query getOrderBook($optionId: String!, $optionMarketKey: MarketKey!) {
        orderBook(optionId: $optionId, optionMarketKey: $optionMarketKey) {
            asks {
                price
                amount
            }
            bids {
                price
                amount
            }
        }
    }
`;

const AsksText: React.FunctionComponent = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: red;
`;

const BidsText: React.FunctionComponent = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: green;
`;

const Divider: React.FunctionComponent = styled.div`
    width: 100%;
    border: 1px solid white;
`;

export function OrderBook(): JSX.Element {
    const { state }: Partial<ContextState> = useContext(ContextApp);
    const { data, error }: QueryResult<{ orderBook: OrderBookModel }> = useQuery(GET_ORDER_BOOK, {
        variables: {
            optionId: state.selectedOptionForOrderBook?.optionId || '',
            optionMarketKey: state.selectedOptionForOrderBook?.optionMarketKey || 'DERIBIT',
        },
    });

    return (
        <>
            <TableRow>{'ORDER BOOK'}</TableRow>
            <TableRow>
                <TableCell className={'TODO-order-book-column-size'}>
                    <TitleText>Price</TitleText>
                </TableCell>
                <TableCell className={'TODO-order-book-column-size'}>
                    <TitleText>Amount</TitleText>
                </TableCell>
            </TableRow>
            {error && <TableRow>{error.toString()}</TableRow>}
            {!error && !data?.orderBook && <TableRow>{'Select option...'}</TableRow>}
            {!error && data?.orderBook && (
                <>
                    {data.orderBook.asks?.slice().reverse().map(
                        (order: OrderBookOrder): JSX.Element => (
                            <TableRow>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <AsksText>{order.price}</AsksText>
                                </TableCell>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <TitleText>{order.amount}</TitleText>
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                    {data.orderBook.asks?.length === 0 && <TableRow>{'No asks...'}</TableRow>}
                    <Divider />
                    {data.orderBook?.bids.map(
                        (order: OrderBookOrder): JSX.Element => (
                            <TableRow>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <BidsText>{order.price}</BidsText>
                                </TableCell>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <TitleText>{order.amount}</TitleText>
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                    {data.orderBook?.bids.length === 0 && <TableRow>{'No bids...'}</TableRow>}
                </>
            )}
        </>
    );
}
