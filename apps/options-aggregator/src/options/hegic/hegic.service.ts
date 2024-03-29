import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, ESymbol, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import * as sleep from 'sleep-promise';
import BigNumber from 'bignumber.js';
import { OrderBook } from '@app/shared/orderbook.schema';
import { GweiPrice } from '@app/shared/price.schema';

type TOptionsResponse = {
    hegicOptions: Array<{
        id: string;
        underlying: {
            symbol: ESymbol;
            decimals: number;
        };
        strike: string;
        expiration: string;
        type: string;
        premium: string;
    }>;
};

type TRawOption = TOptionsResponse['hegicOptions'][0];

const API = 'https://api.thegraph.com/subgraphs/name/cvauclair/hegic';
const MS_MULTIPLY = 1000;
const DECIMAL_DELIMITER = 100_000_000;
const PAGE_SIZE = 1000;
const TRANSACTION_GAS_AMOUNT = 14_250_000;

@Injectable()
export class HegicService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(HegicService.name);
    protected readonly pageSize: number = 1000;

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const result: Array<TRawOption> = [];
        let skip = 0;

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

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        const premium: BigNumber = new BigNumber(rawOption.premium);
        const decimals: BigNumber = new BigNumber(rawOption.underlying.decimals);
        const askInBase: number = premium.div(new BigNumber(10).pow(decimals)).toNumber();
        const btcUsdPrice: number = await this.priceService.getPrice(ESymbol.BTC);

        return {
            optionId: rawOption.id,
            optionMarketKey: EMarketKey.HEGIC,
            asks: [{ price: askInBase * btcUsdPrice, amount: 0 }],
            bids: [{ price: 0, amount: 0 }],
        };
    }

    protected async constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Promise<Option> {
        const ethPrice: number = await this.priceService.getPrice(ESymbol.ETH);
        const { standard: gwei }: GweiPrice = await this.priceService.getGwei();
        const takerTransactionUsd: number = TRANSACTION_GAS_AMOUNT * gwei * ethPrice;

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
            askBase: null,
            askQuote: orderBook.asks[0]?.price || 0,
            bidBase: null,
            bidQuote: orderBook.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.AMERICAN,
            fees: {
                takerTransactionUsd,
            },
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
