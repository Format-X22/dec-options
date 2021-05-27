import { Injectable } from '@nestjs/common';
import { EOptionType, Option } from '@app/shared/option.schema';
import { IAggregator } from '../options-aggregator.service';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

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

const API: string = 'https://api.thegraph.com/subgraphs/name/cvauclair/hegic';
const MS_MULTIPLY: number = 1000;
const DECIMAL_DELIMITER: number = 100_000_000;

@Injectable()
export class HegicService implements IAggregator {
    async getCurrentData(): Promise<Array<Option>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery());

        return rawOptionsResponse.hegicOptions.map(
            (data: TOptionsResponse['hegicOptions'][0]): Option => {
                return {
                    id: data.id,
                    name: data.id,
                    marketKey: EMarketKey.HEGIC,
                    marketType: EMarketType.DEX,
                    type: data.type.toUpperCase() as EOptionType,
                    size: 1,
                    strike: Number(data.strike) / DECIMAL_DELIMITER,
                    expirationDate: new Date(Number(data.expiration) * MS_MULTIPLY),
                    base: data.underlying.symbol,
                    quote: 'USD',
                    strikeAsset: data.underlying.symbol,
                    marketUrl: 'https://www.hegic.co/',
                    price: null, // TODO -
                };
            },
        );
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
