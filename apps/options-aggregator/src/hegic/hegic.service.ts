import { Injectable, Logger } from '@nestjs/common';
import { EOptionType, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';

type TOptionsResponse = {
    hegicOptions: Array<{
        id: string;
        underlying: {
            symbol: string;
        };
        strike: string;
        expiration: string;
        type: string;
    }>;
};

type TRawOption = TOptionsResponse['hegicOptions'][0];
type TDepth = Object;

const API: string = 'https://api.thegraph.com/subgraphs/name/cvauclair/hegic';
const MS_MULTIPLY: number = 1000;
const DECIMAL_DELIMITER: number = 100_000_000;

@Injectable()
export class HegicService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(HegicService.name);

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery());

        return rawOptionsResponse.hegicOptions;
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        return {}; // TODO -
    }

    protected constructOptionData(rawOption: TRawOption, depth: TDepth): Option {
        return {
            id: rawOption.id,
            name: rawOption.id,
            marketKey: EMarketKey.HEGIC,
            marketType: EMarketType.DEX,
            type: rawOption.type.toUpperCase() as EOptionType,
            size: 1,
            strike: Number(rawOption.strike) / DECIMAL_DELIMITER,
            expirationDate: new Date(Number(rawOption.expiration) * MS_MULTIPLY),
            base: rawOption.underlying.symbol,
            quote: 'USD',
            strikeAsset: rawOption.underlying.symbol,
            marketUrl: 'https://www.hegic.co/',
            ask: null, // TODO -
            bid: null, // TODO -
        };
    }

    private getQuery(): string {
        const now: number = Math.floor(Date.now() / MS_MULTIPLY);

        return gql`{  
            hegicOptions(where: {state: Active expiration_gt: ${now}}) {
                id
                underlying {
                    symbol
                }
                strike
                amount
                expiration
                type
            }
        }`;
    }
}
