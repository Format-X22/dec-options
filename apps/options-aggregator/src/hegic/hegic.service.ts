import { Injectable } from '@nestjs/common';
import { EMarket, EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { IAggregator } from '../options-aggregator.service';
import { gql, request } from 'graphql-request';

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

@Injectable()
export class HegicService implements IAggregator {
    async getCurrentData(): Promise<Array<OptionsData>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery());

        return rawOptionsResponse.hegicOptions.map(
            (data: TOptionsResponse['hegicOptions'][0]): OptionsData => {
                return {
                    id: data.id,
                    name: data.id,
                    market: EMarket.HEGIC,
                    marketType: EMarketType.DEX,
                    type: data.type.toUpperCase() as EOptionType,
                    size: 1,
                    strike: Number(data.strike),
                    expirationDate: new Date(Number(data.expiration) * MS_MULTIPLY),
                    base: data.underlying.symbol,
                    quote: 'USD',
                    strikeAsset: data.underlying.symbol,
                    marketUrl: null,
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
