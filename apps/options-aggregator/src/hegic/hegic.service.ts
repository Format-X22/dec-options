import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import * as sleep from 'sleep-promise';
import BigNumber from 'bignumber.js';

type TOptionsResponse = {
    hegicOptions: Array<{
        id: string;
        underlying: {
            symbol: string;
            decimals: number;
        };
        strike: string;
        expiration: string;
        type: string;
        premium: string;
    }>;
};

type TRawOption = TOptionsResponse['hegicOptions'][0];
type TDepth = { ask: number };

const API: string = 'https://api.thegraph.com/subgraphs/name/cvauclair/hegic';
const MS_MULTIPLY: number = 1000;
const DECIMAL_DELIMITER: number = 100_000_000;
const PAGE_SIZE: number = 1000;

@Injectable()
export class HegicService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(HegicService.name);

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const result: Array<TRawOption> = [];
        let skip: number = 0;

        while (true) {
            const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery(skip));
            const data: Array<TRawOption> = rawOptionsResponse.hegicOptions;

            if (!data.length) {
                break;
            }

            result.push(...data);
            skip += PAGE_SIZE;

            await sleep(this.rateLimit);
        }

        return result;
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        const premium: BigNumber = new BigNumber(rawOption.premium);
        const decimals: BigNumber = new BigNumber(rawOption.underlying.decimals);

        return { ask: premium.div(new BigNumber(10).pow(decimals)).toNumber() };
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
            askBase: null, // TODO -
            askQuote: depth.ask, // TODO -
            askCount: null, // TODO -
            bidBase: null,
            bidQuote: null,
            bidCount: null,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.AMERICAN,
        };
    }

    private getQuery(skip: number): string {
        const now: number = Math.floor(Date.now() / MS_MULTIPLY);

        return gql`{  
            hegicOptions(where: {state: Active expiration_gt: ${now}} skip: ${skip} first: ${PAGE_SIZE}) {
                id
                underlying {
                    symbol
                    decimals
                }
                strike
                amount
                expiration
                type
                premium
            }
        }`;
    }
}
