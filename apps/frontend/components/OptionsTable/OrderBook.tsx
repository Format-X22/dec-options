import { FC } from 'react';
import { TableRow } from '../StrikesTable/TableRow';
import { TableCell } from '../StrikesTable/TableCell';
import { TitleText } from '../StrikesTable/TitleText';
import { DocumentNode, gql, useQuery } from '@apollo/client';
import { OrderBook as OrderBookModel, OrderBookOrder } from '@app/shared/orderbook.schema';
import { QueryResult } from '@apollo/client/react/types/types';
import styled from 'styled-components';
import { OptionFees, OptionGQL } from '@app/shared/option.schema';
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
                fees {
                    takerPercent
                    takerTransactionUsd
                }
            }
        }
    }
`;

const AsksText: FC = styled.div`
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 24px;
    color: #d27171;
`;

const BidsText: FC = styled.div`
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 24px;
    color: #71d298;
`;

const SubTable: FC<{ reverse?: boolean }> = styled.div`
    max-height: 50%;
    overflow-y: auto;
    display: flex;
    flex-direction: ${({ reverse }: { reverse?: boolean }) => (reverse ? 'column-reverse' : 'column')};

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

const OrderBookTable = styled.div`
    background: #3a3a3a;
    border: 1px solid #3a3a3a;
    border-radius: 6px;

    .table-row {
        min-height: 52px;
        background: #3a3a3a;
        border: 0;
        border-bottom: 1px solid #303030;
    }
    .title-text {
        text-align: left;
        justify-content: flex-start;
        padding-left: 24px;
        padding-right: 24px;
    }
    .asks-weight {
        top: 0;
        left: 0;
        position: absolute;
        height: 100%;
        background-color: rgba(210, 113, 113, 0.06);
    }
    .bids-weight {
        top: 0;
        left: 0;
        position: absolute;
        height: 100%;
        background-color: rgba(113, 210, 152, 0.06);
    }
`;

type OrderWithWeight = OrderBookOrder & { weight?: number };

export function OrderBook(): JSX.Element {
    const router = useRouter();
    const { date, strike, base, type } = router.query as unknown as ITradeQuery;

    const fromExpirationDate = new Date(date || 0);

    fromExpirationDate.setHours(0);
    fromExpirationDate.setMinutes(0);
    fromExpirationDate.setSeconds(0);

    const toExpirationDate = new Date(date || 0);

    toExpirationDate.setHours(23);
    toExpirationDate.setMinutes(59);
    toExpirationDate.setSeconds(59);

    const { data: optionGroupData, error: optionGroupError }: QueryResult<{ options: { data: Array<OptionGQL> } }> =
        useQuery(GET_OPTIONS, {
            variables: {
                type: type?.toUpperCase() || 'CALL',
                base: base || '',
                strike: +strike || 0,
                fromExpirationDate,
                toExpirationDate,
            },
        });

    const marketFeesMap: Map<string, OptionFees | undefined> = new Map();

    for (const option of optionGroupData?.options.data || []) {
        marketFeesMap.set(option.market.name, option?.fees);
    }

    const asks: Array<OrderWithWeight> = [];
    const bids: Array<OrderWithWeight> = [];

    const { data, error }: QueryResult<{ orderBook: OrderBookModel }> = useQuery(
        makeOrderBookQuery(optionGroupData?.options.data),
    );

    if (data) {
        for (const [key, orderBook] of Object.entries(data)) {
            const marketName: string = key.split('_')[1];
            let asksData = orderBook?.asks || [];
            let bidsData = orderBook?.bids || [];

            asksData = asksData.map(
                (order: OrderBookOrder): OrderWithWeight => ({
                    ...order,
                    marketName,
                    weight: order.price * order.amount,
                    fees: marketFeesMap.get(marketName),
                }),
            );
            bidsData = bidsData.map(
                (order: OrderBookOrder): OrderWithWeight => ({
                    ...order,
                    marketName,
                    weight: order.price * order.amount,
                    fees: marketFeesMap.get(marketName),
                }),
            );

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
    const maxAsksWeight = Math.max(...asks.map(({ weight }) => weight || 0));
    const maxBidsWeight = Math.max(...bids.map(({ weight }) => weight || 0));

    return (
        <OrderBookTable>
            {/* <TableRow maxHeight={52} className='table-row'>
                <TableCell>ORDER BOOK</TableCell>
            </TableRow> */}
            <TableRow maxHeight={52} className='table-row'>
                <TableCell>
                    <TitleText className='title-text'>Price</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText className='title-text'>Amount</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText className='title-text'>Source</TitleText>
                </TableCell>
                <TableCell>
                    <TitleText className='title-text'>Fees</TitleText>
                </TableCell>
            </TableRow>
            {optionGroupError && (
                <TableRow maxHeight={52} className='table-row'>
                    {optionGroupError.toString()}
                </TableRow>
            )}
            {!optionGroupError && error && (
                <TableRow maxHeight={52} className='table-row'>
                    {error.toString()}
                </TableRow>
            )}
            {!optionGroupError && !error && (
                <SubTablesWrapper>
                    <SubTable reverse>
                        {asks.slice().map(
                            ({ price, amount, marketName, fees, weight }, index): JSX.Element => (
                                <TableRow
                                    maxHeight={53}
                                    key={`asks-${index}-${price}-${amount}-${marketName}`}
                                    className='table-row'
                                >
                                    {weight && (
                                        <div
                                            className='asks-weight'
                                            style={{ width: `${(weight / maxAsksWeight) * 100}%` }}
                                        />
                                    )}
                                    <TableCell>
                                        <AsksText>{price.toFixed(4)}</AsksText>
                                    </TableCell>
                                    <TableCell>
                                        <TitleText className='title-text'>{amount.toFixed(2)}</TitleText>
                                    </TableCell>
                                    <TableCell>
                                        <TitleText className='title-text'>{marketName}</TitleText>
                                    </TableCell>
                                    <TableCell>
                                        <TitleText className='title-text'>{formatFees(fees)}</TitleText>
                                    </TableCell>
                                </TableRow>
                            ),
                        )}
                        {asks.length === 0 && (
                            <TableRow maxHeight={53} className='table-row'>
                                <TableCell width='100%'>No asks...</TableCell>
                            </TableRow>
                        )}
                    </SubTable>
                    <TableRow maxHeight={52} className='table-row'>
                        &nbsp;
                    </TableRow>
                    <SubTable>
                        {bids.map(
                            ({ price, amount, marketName, fees, weight }, index): JSX.Element => (
                                <TableRow
                                    maxHeight={53}
                                    key={`bids-${index}-${price}-${amount}-${marketName}`}
                                    className='table-row'
                                >
                                    {weight && (
                                        <div
                                            className='bids-weight'
                                            style={{ width: `${(weight / maxBidsWeight) * 100}%` }}
                                        />
                                    )}
                                    <TableCell>
                                        <BidsText>{price.toFixed(4)}</BidsText>
                                    </TableCell>
                                    <TableCell>
                                        <TitleText className='title-text'>{amount.toFixed(2)}</TitleText>
                                    </TableCell>
                                    <TableCell>
                                        <TitleText className='title-text'>{marketName}</TitleText>
                                    </TableCell>
                                    <TableCell>
                                        <TitleText className='title-text'>{formatFees(fees)}</TitleText>
                                    </TableCell>
                                </TableRow>
                            ),
                        )}
                        {bids.length === 0 && (
                            <TableRow maxHeight={53} className='table-row'>
                                <TableCell width='100%'>No bids...</TableCell>
                            </TableRow>
                        )}
                    </SubTable>
                </SubTablesWrapper>
            )}
        </OrderBookTable>
    );
}

function makeOrderBookQuery(options: Array<OptionGQL> = []): DocumentNode {
    let body: string = '';

    options.forEach((option: OptionGQL, index: number) => {
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

function formatFees(fees?: OptionFees): string {
    if (!fees) {
        return 'N/A';
    }

    let result: Array<string> = [];

    if (fees.takerPercent) {
        result.push(`${fees.takerPercent}%`);
    }

    if (fees.takerTransactionUsd) {
        result.push(`$${fees.takerTransactionUsd.toFixed(2)} for gas`);
    }

    return result.join(' + ');
}
