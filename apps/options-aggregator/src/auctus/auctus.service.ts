import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';

type TOptionsResponse = {
    acotokens: Array<{
        id: string;
        name: string;
        isCall: boolean;
        expiryTime: string;
        strikePrice: string;
        collateral: {
            symbol: string;
        };
        underlying: {
            symbol: string;
        };
        strikeAsset: {
            symbol: string;
        };
    }>;
};

type TRawOption = TOptionsResponse['acotokens'][0];
type TDepth = Object;

const API: string = 'https://api.thegraph.com/subgraphs/name/auctusproject/auctus-options';
const MS_MULTIPLY: number = 1000;

@Injectable()
export class AuctusService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(AuctusService.name);

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery());

        return rawOptionsResponse.acotokens;
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        return {}; // TODO -
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
            askBase: null, // TODO -
            askQuote: null, // TODO -
            bidBase: null, // TODO -
            bidQuote: null, // TODO -
            deliveryType: EOptionDeliveryType.DELIVERY,
            styleType: EOptionStyleType.AMERICAN,
        };
    }

    private getQuery(): string {
        const now: number = Math.floor(Date.now() / MS_MULTIPLY);

        return gql`
            {
                acotokens(where: { expiryTime_gt: ${now} }) {
                    id
                    underlying {
                        symbol
                    }
                    strikeAsset {
                        symbol
                    }
                    collateral {
                        symbol
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
