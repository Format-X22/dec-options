import React, { FC, useEffect, useRef } from 'react';
import { TableRow } from '../StrikesTable/TableRow';
import { TableCell } from '../StrikesTable/TableCell';
import { TitleText } from '../StrikesTable/TitleText';
import { DocumentNode, gql, useQuery } from '@apollo/client';
import { OrderBook as OrderBookModel, OrderBookOrder } from '../../../../libs/shared/src/orderbook.schema';
import { QueryResult } from '@apollo/client/react/types/types';
import styled from 'styled-components';
import { Option, OptionGQL } from '../../../../libs/shared/src/option.schema';
import { useRouter } from 'next/router';
import { ITradeQuery } from '../../dtos/ITradeQuery';

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

const AsksText: FC = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: red;
`;

const BidsText: FC = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: green;
`;


const SubTable: FC<{reverse?: boolean}> = styled.div`
    max-height: 50%;
    overflow-y: auto;
    display: flex;
    flex-direction: ${({ reverse }: {reverse?: boolean}) => (reverse ? 'column-reverse' : 'column')};

    &::-webkit-scrollbar-thumb {
      background: #303030;
      border-radius: 12px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    &::-webkit-scrollbar {
      padding: 2px;
      width: 12px;
      height: 12px;
      background: #000000;
    }
`;

const SubTablesWrapper: FC = styled.div`
    overflow: hidden;
    flex: 100;
`;

const Divider: FC = styled.div`
    width: 100%;
    border: 1px solid white;
`;

export function OrderBook(): JSX.Element {
    const router = useRouter();
    const {date, strike, base, type} = router.query as unknown as ITradeQuery;

    const fromExpirationDate = new Date(date || 0);

    fromExpirationDate.setHours(0);
    fromExpirationDate.setMinutes(0);
    fromExpirationDate.setSeconds(0);

    const toExpirationDate = new Date(date || 0);

    toExpirationDate.setHours(23);
    toExpirationDate.setMinutes(59);
    toExpirationDate.setSeconds(59);

    const { data: optionGroupData, error: optionGroupError }: QueryResult<{ options: { data: Array<Option> } }> =
        useQuery(GET_OPTIONS, {
            variables: {
                type: type?.toUpperCase() || 'CALL',
                base: base || '',
                strike: +strike || 0,
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
            <TableRow><TableCell>ORDER BOOK</TableCell></TableRow>
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
                <SubTablesWrapper>
                  <SubTable reverse>
                      {asks
                        .slice()
                        .map(
                            ({price, amount, marketName}: OrderBookOrder, index): JSX.Element => (
                                <TableRow key={`asks-${index}-${price}-${amount}-${marketName}`}>
                                    <TableCell className={'TODO-order-book-column-size'}>
                                        <AsksText>{price}</AsksText>
                                    </TableCell>
                                    <TableCell className={'TODO-order-book-column-size'}>
                                        <TitleText>{amount}</TitleText>
                                    </TableCell>
                                    <TableCell className={'TODO-order-book-column-size'}>
                                        <TitleText>{marketName}</TitleText>
                                    </TableCell>
                                </TableRow>
                            ),
                      )}
                      {asks.length === 0 && <TableRow><TableCell>No asks...</TableCell></TableRow>}
                  </SubTable>
                  <Divider />
                  <SubTable>
                    {bids.map(
                        ({price, amount, marketName}: OrderBookOrder, index): JSX.Element => (
                            <TableRow key={`bids-${index}-${price}-${amount}-${marketName}`}>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <BidsText>{price}</BidsText>
                                </TableCell>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <TitleText>{amount}</TitleText>
                                </TableCell>
                                <TableCell className={'TODO-order-book-column-size'}>
                                    <TitleText>{marketName}</TitleText>
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                    {bids.length === 0 && <TableRow><TableCell>No bids...</TableCell></TableRow>}
                  </SubTable>
                </SubTablesWrapper>
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
