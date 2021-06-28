import { BigNumber } from 'bignumber.js';
import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { AxiosResponse } from 'axios';

type TOptionsResponse = {
    acotokens: Array<{
        id: string;
        name: string;
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
type TRawDepth = {
    records: Array<{
        order: {
            makerAmount: string;
            takerAmount: string;
        };
    }>;
};
type TDepthItem = { price: number; amount: number };
type TDepth = {
    asks: Array<TDepthItem>;
    bids: Array<TDepthItem>;
};

const API: string = 'https://api.thegraph.com/subgraphs/name/auctusproject/auctus-options';
const MS_MULTIPLY: number = 1000;
const USDT_CONTRACT: string = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const USDT_DECIMALS: number = 6;

@Injectable()
export class AuctusService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(AuctusService.name);
    protected readonly pageSize: number = 1000;
    protected isGetWithPagination: boolean = true;

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(skip: number): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery(skip));

        return rawOptionsResponse.acotokens;
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        const asks: Array<TDepthItem> = [];
        const bids: Array<TDepthItem> = [];
        const askUrl: string = this.makeDepthUrl(rawOption.id, USDT_CONTRACT);
        const bidUrl: string = this.makeDepthUrl(USDT_CONTRACT, rawOption.id);
        const askRawOrders: AxiosResponse<TRawDepth> = await this.httpService.get(askUrl).toPromise();
        const bidRawOrders: AxiosResponse<TRawDepth> = await this.httpService.get(bidUrl).toPromise();

        for (const { order } of askRawOrders.data.records) {
            const amount: number = this.applyDecimals(order.makerAmount, rawOption.underlying.decimals);
            const price: number = this.applyDecimals(order.takerAmount, USDT_DECIMALS) / amount;

            asks.push({ amount, price });
        }

        for (const { order } of bidRawOrders.data.records) {
            const amount: number = this.applyDecimals(order.takerAmount, rawOption.underlying.decimals);
            const price: number = this.applyDecimals(order.makerAmount, USDT_DECIMALS) / amount;

            bids.push({ amount, price });
        }

        asks.sort((a: TDepthItem, b: TDepthItem): number => b.price - a.price);
        bids.sort((a: TDepthItem, b: TDepthItem): number => b.price - a.price);

        return { asks, bids };
    }

    protected constructOptionData(rawOption: TRawOption, depth: TDepth): Option {
        const id: string = rawOption.id;
        const base: string = rawOption.underlying.symbol;
        const quote: string = rawOption.collateral.symbol;
        const strikeAsset: string = rawOption.strikeAsset.symbol;

        return {
            id,
            name: rawOption.name,
            marketKey: EMarketKey.AUCTUS,
            marketType: EMarketType.DEX,
            type: rawOption.isCall ? EOptionType.CALL : EOptionType.PUT,
            size: 1,
            strike: Number(rawOption.strikePrice),
            expirationDate: new Date(Number(rawOption.expiryTime) * MS_MULTIPLY),
            base,
            quote,
            strikeAsset,
            marketUrl: `https://app.auctus.org/advanced/trade/${base}_${strikeAsset}/${id}`,
            askBase: null,
            askQuote: depth.asks[depth.asks.length - 1]?.price || 0,
            bidBase: null,
            bidQuote: depth.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.DELIVERY,
            styleType: EOptionStyleType.AMERICAN,
        };
    }

    private getQuery(skip: number): string {
        const now: number = Math.floor(Date.now() / MS_MULTIPLY);

        return gql`
            {
                acotokens(where: { expiryTime_gt: ${now} } first: ${this.pageSize} skip: ${skip}) {
                    id
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

    private makeDepthUrl(maker: string, taker: string): string {
        return `https://api.0x.org/sra/v4/orders?makerToken=${maker}&takerToken=${taker}&page=1&perPage=100`;
    }

    private applyDecimals(numberString: string, decimals: number | string): number {
        return new BigNumber(numberString).div(new BigNumber(10).pow(decimals)).toNumber();
    }
}
