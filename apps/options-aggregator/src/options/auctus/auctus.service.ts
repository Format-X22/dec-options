import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, ESymbol, Option } from '@app/shared/option.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook } from '@app/shared/orderbook.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import BigNumber from 'bignumber.js';
import { GweiPrice } from '@app/shared/price.schema';

type TOptionsResponse = {
    acotokens: Array<{
        id: string;
        name: string;
        decimals: string;
        isCall: boolean;
        expiryTime: string;
        strikePrice: string;
        collateral: {
            symbol: string;
            decimals: string;
        };
        underlying: {
            symbol: string;
            decimals: string;
        };
        strikeAsset: {
            symbol: string;
            decimals: string;
        };
    }>;
};

type TRawOption = TOptionsResponse['acotokens'][0];

type TRawOrderBook = Array<{
    order: {
        makerAmount: string;
        takerAmount: string;
    };
}>;

const THE_GRAPH_API = 'https://api.thegraph.com/subgraphs/name/auctusproject/auctus-options';
const SECOND = 1000;
const ORDER_BOOK_API = 'https://api.0x.org/sra/v4/orders';
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const TRANSACTION_GAS_AMOUNT = 113_846;

@Injectable()
export class AuctusService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(AuctusService.name);
    protected readonly isGetWithPagination: boolean = true;
    protected readonly pageSize: number = 1000;

    protected get rateLimit(): number {
        return 3000;
    }

    protected async getRawOptions(skip: number): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(THE_GRAPH_API, this.getQuery(skip));

        return rawOptionsResponse.acotokens;
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        const orderBook: OrderBook = {
            optionMarketKey: EMarketKey.AUCTUS,
            optionId: rawOption.id,
            asks: [],
            bids: [],
        };
        const orderBookAsksResponse = await this.httpService
            .get(`${ORDER_BOOK_API}?makerToken=${rawOption.id}&takerToken=${USDC_ADDRESS}&perPage=100`)
            .toPromise();
        const rawAsksOrderBook: TRawOrderBook = orderBookAsksResponse.data.records;
        const orderBookBidsResponse = await this.httpService
            .get(`${ORDER_BOOK_API}?makerToken=${USDC_ADDRESS}&takerToken=${rawOption.id}&perPage=100`)
            .toPromise();
        const rawBidsOrderBook: TRawOrderBook = orderBookBidsResponse.data.records;
        const optionDecimalsMul: BigNumber = new BigNumber(10).pow(rawOption.decimals);
        const strikeDecimalsMul: BigNumber = new BigNumber(10).pow(rawOption.strikeAsset.decimals);

        for (const { order } of rawAsksOrderBook) {
            const amount = new BigNumber(order.makerAmount).div(optionDecimalsMul).toNumber();
            const price = new BigNumber(order.takerAmount).div(strikeDecimalsMul).div(amount).toNumber();

            orderBook.asks.push({ amount, price });
        }

        for (const { order } of rawBidsOrderBook) {
            const amount = new BigNumber(order.takerAmount).div(optionDecimalsMul).toNumber();
            const price = new BigNumber(order.makerAmount).div(strikeDecimalsMul).div(amount).toNumber();

            orderBook.bids.push({ price, amount });
        }

        return orderBook;
    }

    protected async constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Promise<Option> {
        const id: string = rawOption.id;
        const base: ESymbol = rawOption.underlying.symbol as ESymbol;
        const quote: string = rawOption.collateral.symbol;
        const strikeAsset: string = rawOption.strikeAsset.symbol;
        const ethPrice: number = await this.priceService.getPrice(ESymbol.ETH);
        const { standard: gwei }: GweiPrice = await this.priceService.getGwei();
        const takerTransactionUsd: number = TRANSACTION_GAS_AMOUNT * gwei * ethPrice;

        return {
            id,
            name: rawOption.name,
            marketKey: EMarketKey.AUCTUS,
            marketType: EMarketType.DEX,
            type: rawOption.isCall ? EOptionType.CALL : EOptionType.PUT,
            size: 1,
            strike: Number(rawOption.strikePrice),
            expirationDate: new Date(Number(rawOption.expiryTime) * SECOND),
            base,
            quote,
            strikeAsset,
            marketUrl: `https://app.auctus.org/advanced/trade/${base}_${strikeAsset}/${id}`,
            askBase: null,
            askQuote: orderBook.asks[0]?.price || 0,
            bidBase: null,
            bidQuote: orderBook.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.DELIVERY,
            styleType: EOptionStyleType.AMERICAN,
            fees: {
                takerTransactionUsd,
            },
        };
    }

    private getQuery(skip: number): string {
        const now: number = Math.floor(Date.now() / SECOND);

        return gql`
            {
                acotokens(where: { expiryTime_gt: ${now} } first: ${this.pageSize} skip: ${skip}) {
                    id
                    decimals
                    underlying {
                        symbol
                        decimals
                    }
                    strikeAsset {
                        symbol
                        decimals
                    }
                    collateral {
                        symbol
                        decimals
                    }
                    name
                    isCall
                    strikePrice
                    expiryTime
                }
            }
        `;
    }
}
