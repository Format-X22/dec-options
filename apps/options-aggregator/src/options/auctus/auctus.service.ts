import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, ESymbol, Option } from '@app/shared/option.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook } from '@app/shared/orderbook.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

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

const API: string = 'https://api.thegraph.com/subgraphs/name/auctusproject/auctus-options';
const MS_MULTIPLY: number = 1000;

@Injectable()
export class AuctusService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(AuctusService.name);
    protected readonly isGetWithPagination: boolean = true;
    protected readonly pageSize: number = 1000;

    protected get rateLimit(): number {
        return 3000;
    }

    protected async getRawOptions(skip: number): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery(skip));

        return rawOptionsResponse.acotokens;
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        // TODO Implement
        return null;
    }

    protected constructOptionData(rawOption: TRawOption): Option {
        const id: string = rawOption.id;
        const base: ESymbol = rawOption.underlying.symbol as ESymbol;
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
            askQuote: null,
            bidBase: null,
            bidQuote: null,
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
}
