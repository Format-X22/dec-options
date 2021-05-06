import { Injectable } from '@nestjs/common';
import { EMarket, EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { IAggregator } from '../options-aggregator.service';
import { gql, request } from 'graphql-request';

type TOptionsResponse = {
    otokens: Array<{
        id: string;
        name: string;
        isPut: boolean;
        expiryTimestamp: string;
        strikePrice: string;
        decimals: number;
        underlyingAsset: {
            symbol: string;
        };
        strikeAsset: {
            symbol: string;
        };
        collateralAsset: {
            symbol: string;
        };
    }>;
};

const API: string = 'https://api.thegraph.com/subgraphs/name/opynfinance/gamma-mainnet';
const MS_MULTIPLY: number = 1000;

@Injectable()
export class OpynService implements IAggregator {
    async getCurrentData(): Promise<Array<OptionsData>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery());

        return rawOptionsResponse.otokens.map(
            (data: TOptionsResponse['otokens'][0]): OptionsData => {
                return {
                    id: data.id,
                    name: data.name,
                    market: EMarket.OPYN,
                    marketType: EMarketType.DEX,
                    type: data.isPut ? EOptionType.PUT : EOptionType.CALL,
                    size: 1,
                    strike: Number(data.strikePrice) / Math.pow(10, data.decimals),
                    expirationDate: new Date(Number(data.expiryTimestamp) * MS_MULTIPLY),
                    base: data.underlyingAsset.symbol,
                    quote: data.collateralAsset.symbol,
                    strikeAsset: data.strikeAsset.symbol,
                    marketUrl: 'https://www.opyn.co/#/trade',
                };
            },
        );
    }

    private getQuery(): string {
        const now: number = Math.floor(Date.now() / MS_MULTIPLY);

        return gql`
            {
                otokens(where: { expiryTimestamp_gt: ${now} }) {
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
}
