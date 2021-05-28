import { Injectable, Logger } from '@nestjs/common';
import { EOptionType, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';

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

type TRawOption = TOptionsResponse['otokens'][0];
type TDepth = Object;

const API: string = 'https://api.thegraph.com/subgraphs/name/opynfinance/gamma-mainnet';
const MS_MULTIPLY: number = 1000;

@Injectable()
export class OpynService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(OpynService.name);

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery());

        return rawOptionsResponse.otokens;
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        return {}; // TODO -
    }

    protected constructOptionData(rawOption: TRawOption, depth: TDepth): Option {
        return {
            id: rawOption.id,
            name: rawOption.name,
            marketKey: EMarketKey.OPYN,
            marketType: EMarketType.DEX,
            type: rawOption.isPut ? EOptionType.PUT : EOptionType.CALL,
            size: 1,
            strike: Number(rawOption.strikePrice) / Math.pow(10, rawOption.decimals),
            expirationDate: new Date(Number(rawOption.expiryTimestamp) * MS_MULTIPLY),
            base: rawOption.underlyingAsset.symbol,
            quote: rawOption.collateralAsset.symbol,
            strikeAsset: rawOption.strikeAsset.symbol,
            marketUrl: 'https://www.opyn.co/#/trade',
            ask: null, // TODO -
            bid: null, // TODO -
        };
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
