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
const QUERY: string = gql`
    {
        acotokens {
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
const MS_MULTIPLY: number = 1000;

@Injectable()
export class AuctusService implements IAggregator {
    async getCurrentData(): Promise<Array<OptionsData>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, QUERY);

        return rawOptionsResponse.acotokens.map(
            (data: TOptionsResponse['acotokens'][0]): OptionsData => {
                return {
                    id: data.id,
                    name: data.name,
                    market: EMarket.AUCTUS,
                    marketType: EMarketType.DEX,
                    type: data.isCall ? EOptionType.CALL : EOptionType.PUT,
                    size: 1,
                    strike: Number(data.strikePrice),
                    expirationDate: new Date(Number(data.expiryTime) * MS_MULTIPLY),
                    base: data.underlying.symbol,
                    quote: data.collateral.symbol,
                    strikeAsset: data.strikeAsset.symbol,
                    marketUrl: null,
                };
            },
        );
    }
}
