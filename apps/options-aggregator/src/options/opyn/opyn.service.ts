import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, ESymbol, Option } from '@app/shared/option.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook } from '@app/shared/orderbook.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

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
        };
        collateralAsset: {
            symbol: ESymbol;
        };
    }>;
};

type TRawOption = TOptionsResponse['otokens'][0];

const theGraphApi: string = 'https://api.thegraph.com/subgraphs/name/opynfinance/gamma-mainnet';
const second: number = 1000;

@Injectable()
export class OpynService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(OpynService.name);
    protected readonly isGetWithPagination: boolean = true;
    protected readonly pageSize: number = 1000;

    protected get rateLimit(): number {
        return 3000;
    }

    protected async getRawOptions(skip: number): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(theGraphApi, this.getQuery(skip));

        return rawOptionsResponse.otokens;
    }

    private getQuery(skip: number): string {
        const now: number = Math.floor(Date.now() / second);

        return gql`
            {
                otokens(where: { expiryTimestamp_gt: ${now} } first: ${this.pageSize} skip: ${skip}) {
                    id
                    underlyingAsset {
                        symbol
                    }
                    strikeAsset {
                        symbol
                    }
                    collateralAsset {
                        symbol
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
        return null;
    }

    protected constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Option {
        return {
            id: rawOption.id,
            name: rawOption.name,
            marketKey: EMarketKey.OPYN,
            marketType: EMarketType.DEX,
            type: rawOption.isPut ? EOptionType.PUT : EOptionType.CALL,
            size: 1,
            strike: Number(rawOption.strikePrice) / Math.pow(10, rawOption.decimals),
            expirationDate: new Date(Number(rawOption.expiryTimestamp) * second),
            base: rawOption.underlyingAsset.symbol,
            quote: rawOption.strikeAsset.symbol,
            strikeAsset: rawOption.strikeAsset.symbol,
            marketUrl: 'https://www.opyn.co/#/trade',
            askBase: null,
            askQuote: null, // TODO -
            bidBase: null,
            bidQuote: null, // TODO -
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
        };
    }
}
