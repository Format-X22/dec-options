import React, { useContext } from 'react';
import { TableRow } from '../StrikesTable/TableRow';
import { TableCell } from '../StrikesTable/TableCell';
import { TitleText } from '../StrikesTable/TitleText';
import { DocumentNode, gql, useQuery } from '@apollo/client';
import { OrderBook as OrderBookModel, OrderBookOrder } from '../../../../libs/shared/src/orderbook.schema';
import { QueryResult } from '@apollo/client/react/types/types';
import { ContextState } from '../../pages/stateType';
import { ContextApp } from '../../pages/_app';
import styled from 'styled-components';
import { Option, OptionGQL } from '../../../../libs/shared/src/option.schema';

const GET_OPTIONS = gql`
    query getOptions(
        $type: OptionType
        $base: String!
        $fromExpirationDate: DateTime
        $toExpirationDate: DateTime
        $strike: Float!
    ) {
        options(
            filterByType: $type
            filterByBase: $base
            filterByExpirationDateFrom: $fromExpirationDate
            filterByExpirationDateTo: $toExpirationDate
            filterByStrike: $strike
        ) {
            data {
                id
                strike
                askQuote
                bidQuote
                market {
                    key
                    name
                }
            }
        }
    }
`;

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
    const fromExpirationDate = new Date(state.selectedOptionGroup?.date || 0);

    fromExpirationDate.setHours(0);
    fromExpirationDate.setMinutes(0);
    fromExpirationDate.setSeconds(0);

    const toExpirationDate = new Date(state.selectedOptionGroup?.date || 0);

    toExpirationDate.setHours(23);
    toExpirationDate.setMinutes(59);
    toExpirationDate.setSeconds(59);

    const { data: optionGroupData, error: optionGroupError }: QueryResult<{ options: { data: Array<Option> } }> =
        useQuery(GET_OPTIONS, {
            variables: {
                type: state.selectedOptionGroup?.type.toUpperCase() || 'CALL',
                base: state.selectedOptionGroup?.base || '',
                strike: state.selectedOptionGroup?.strike || 0,
                fromExpirationDate,
                toExpirationDate,
            },
        });

    const asks: Array<OrderBookOrder> = [];
    const bids: Array<OrderBookOrder> = [];

    const { data, error }: QueryResult<{ orderBook: OrderBookModel }> = useQuery(
        makeOrderBookQuery(optionGroupData?.options.data),
    );

    if (data) {
        for (const [key, orderBook] of Object.entries(data)) {
            const marketName: string = key.split('_')[1];
            let asksData: Array<OrderBookOrder> = orderBook?.asks || [];
            let bidsData: Array<OrderBookOrder> = orderBook?.bids || [];

            asksData = asksData.map((order: OrderBookOrder): OrderBookOrder => ({ ...order, marketName }));
            bidsData = bidsData.map((order: OrderBookOrder): OrderBookOrder => ({ ...order, marketName }));

            asks.push(...asksData);
            bids.push(...bidsData);
        }
    }

    asks.sort((a: OrderBookOrder, b: OrderBookOrder): number => {
        if (a.price > b.price) {
            return 1;
        } else {
            return -1;
        }
    });
    bids.sort((a: OrderBookOrder, b: OrderBookOrder): number => {
        if (a.price < b.price) {
            return 1;
        } else {
            return -1;
        }
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
                <TableCell className={'TODO-order-book-column-size'}>
                    <TitleText>Source</TitleText>
                </TableCell>
            </TableRow>
            {optionGroupError && <TableRow>{optionGroupError.toString()}</TableRow>}
            {!optionGroupError && error && <TableRow>{error.toString()}</TableRow>}
            {!optionGroupError && !error && (
                <>
                    {asks
                        .slice()
                        .reverse()
                        .map(
                            (order: OrderBookOrder): JSX.Element => (
                                <TableRow>
                                    <TableCell className={'TODO-order-book-column-size'}>
                                        <AsksText>{order.price}</AsksText>
                                    </TableCell>
                                    <TableCell className={'TODO-order-book-column-size'}>
                                        <TitleText>{order.amount}</TitleText>
                                    </TableCell>
                                    <TableCell className={'TODO-order-book-column-size'}>
                                        <TitleText>{order.marketName}</TitleText>
                                    </TableCell>
                                </TableRow>
                            ),
                        )}
                    {asks.length === 0 && <TableRow>{'No asks...'}</TableRow>}
                    <Divider />
                    {bids.map(
                        (order: OrderBookOrder): JSX.Element => (
                            <TableRow>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <BidsText>{order.price}</BidsText>
                                </TableCell>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <TitleText>{order.amount}</TitleText>
                                </TableCell>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <TitleText>{order.marketName}</TitleText>
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                    {bids.length === 0 && <TableRow>{'No bids...'}</TableRow>}
                </>
            )}
        </>
    );
}

function makeOrderBookQuery(options: Array<Option> = []): DocumentNode {
    let body: string = '';

    options.forEach((option: OptionGQL, index: number): void => {
        body += `
            id${index}_${option.market.name}: orderBook(optionId: "${option.id}", optionMarketKey: ${option.market.key}) {
                optionMarketKey
                asks {
                    price
                    amount
                }
                bids {
                    price
                    amount
                }
            }
        `;
    });

    body = body || 'orderBook(optionId: "", optionMarketKey: DERIBIT) { optionMarketKey }';

    return gql`
        query getOrderBook {
            ${body}
        }
    `;
}
