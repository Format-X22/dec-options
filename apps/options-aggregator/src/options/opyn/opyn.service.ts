import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, ESymbol, Option } from '@app/shared/option.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook } from '@app/shared/orderbook.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import BigNumber from 'bignumber.js';
import { GweiPrice } from '@app/shared/price.schema';

type TOptionsResponse = {
    otokens: Array<{
        id: string;
        name: string;
        isPut: boolean;
        expiryTimestamp: string;
        strikePrice: string;
        decimals: number;
        underlyingAsset: {
            symbol: ESymbol;
        };
        strikeAsset: {
            symbol: ESymbol;
            decimals: number;
        };
        collateralAsset: {
            symbol: ESymbol;
        };
    }>;
};

type TRawOption = TOptionsResponse['otokens'][0];

type TRawOrders = {
    records: Array<{
        order: {
            makerAmount: string;
            takerAmount: string;
        };
        metaData: {
            remainingFillableTakerAmount: string;
        };
    }>;
};
type TRawOrderBook = {
    asks: TRawOrders;
    bids: TRawOrders;
};

const THE_GRAPH_API = 'https://api.thegraph.com/subgraphs/name/opynfinance/gamma-mainnet';
const SECOND = 1000;
const ORDER_BOOK_API = 'https://opyn.api.0x.org/sra/v4/orderbook';
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const TRANSACTION_GAS_AMOUNT = 91_175;

@Injectable()
export class OpynService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(OpynService.name);
    protected readonly isGetWithPagination: boolean = true;
    protected readonly pageSize: number = 1000;

    protected get rateLimit(): number {
        return 3000;
    }

    protected async getRawOptions(skip: number): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(THE_GRAPH_API, this.getQuery(skip));

        return rawOptionsResponse.otokens;
    }

    private getQuery(skip: number): string {
        const now: number = Math.floor(Date.now() / SECOND);

        return gql`
            {
                otokens(where: { expiryTimestamp_gt: ${now} } first: ${this.pageSize} skip: ${skip}) {
                    id
                    underlyingAsset {
                        symbol
                        decimals
                    }
                    strikeAsset {
                        symbol
                        decimals
                    }
                    collateralAsset {
                        symbol
                        decimals
                    }
                    name
                    isPut
                    strikePrice
                    decimals
                    expiryTimestamp
                }
            }
        `;
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        const orderBook: OrderBook = {
            optionMarketKey: EMarketKey.OPYN,
            optionId: rawOption.id,
            asks: [],
            bids: [],
        };
        const orderBookResponse = await this.httpService
            .get(`${ORDER_BOOK_API}?baseToken=${rawOption.id}&quoteToken=${USDC_ADDRESS}&perPage=100`)
            .toPromise();
        const rawOrderBook: TRawOrderBook = orderBookResponse.data;
        const optionDecimalsMul: BigNumber = new BigNumber(10).pow(rawOption.decimals);
        const strikeDecimalsMul: BigNumber = new BigNumber(10).pow(rawOption.strikeAsset.decimals);

        for (const { order, metaData } of rawOrderBook.asks.records) {
            if (Number(metaData.remainingFillableTakerAmount) === 0) {
                continue;
            }

            const amount = new BigNumber(order.makerAmount).div(optionDecimalsMul).toNumber();
            const price = new BigNumber(order.takerAmount).div(strikeDecimalsMul).div(amount).toNumber();

            orderBook.asks.push({ price, amount });
        }

        for (const { order, metaData } of rawOrderBook.bids.records) {
            if (Number(metaData.remainingFillableTakerAmount) === 0) {
                continue;
            }

            const amount = new BigNumber(order.takerAmount).div(optionDecimalsMul).toNumber();
            const price = new BigNumber(order.makerAmount).div(strikeDecimalsMul).div(amount).toNumber();

            orderBook.bids.push({ price, amount });
        }

        return orderBook;
    }

    protected async constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Promise<Option> {
        const ethPrice: number = await this.priceService.getPrice(ESymbol.ETH);
        const { standard: gwei }: GweiPrice = await this.priceService.getGwei();
        const takerTransactionUsd: number = TRANSACTION_GAS_AMOUNT * gwei * ethPrice;

        return {
            id: rawOption.id,
            name: rawOption.name,
            marketKey: EMarketKey.OPYN,
            marketType: EMarketType.DEX,
            type: rawOption.isPut ? EOptionType.PUT : EOptionType.CALL,
            size: 1,
            strike: Number(rawOption.strikePrice) / Math.pow(10, rawOption.decimals),
            expirationDate: new Date(Number(rawOption.expiryTimestamp) * SECOND),
            base: rawOption.underlyingAsset.symbol,
            quote: rawOption.strikeAsset.symbol,
            strikeAsset: rawOption.strikeAsset.symbol,
            marketUrl: 'https://www.opyn.co/#/trade',
            askBase: null,
            askQuote: orderBook.asks[0]?.price || 0,
            bidBase: null,
            bidQuote: orderBook.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
            fees: {
                takerTransactionUsd,
            },
        };
    }
}
