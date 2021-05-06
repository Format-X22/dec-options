import { Injectable } from '@nestjs/common';
import { IAggregator } from '../options-aggregator.service';
import { EMarket, EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { gql, request } from 'graphql-request';

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

const API: string = 'https://api.thegraph.com/subgraphs/name/auctusproject/auctus-options';
const MS_MULTIPLY: number = 1000;

@Injectable()
export class AuctusService implements IAggregator {
    async getCurrentData(): Promise<Array<OptionsData>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery());

        return rawOptionsResponse.acotokens.map(
            (data: TOptionsResponse['acotokens'][0]): OptionsData => {
                const id: string = data.id;
                const base: string = data.underlying.symbol;
                const quote: string = data.collateral.symbol;
                const strikeAsset: string = data.strikeAsset.symbol;

                return {
                    id,
                    name: data.name,
                    market: EMarket.AUCTUS,
                    marketType: EMarketType.DEX,
                    type: data.isCall ? EOptionType.CALL : EOptionType.PUT,
                    size: 1,
                    strike: Number(data.strikePrice),
                    expirationDate: new Date(Number(data.expiryTime) * MS_MULTIPLY),
                    base,
                    quote,
                    strikeAsset,
                    marketUrl: `https://app.auctus.org/advanced/trade/${base}_${strikeAsset}/${id}`,
                };
            },
        );
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
