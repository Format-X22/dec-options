import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, ESymbol, Option } from '@app/shared/option.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook } from '@app/shared/orderbook.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

type TOptionsResponse = {
    markets: Array<{
        id: string;
        marketName: string;
        expirationDate: string;
        collateralToken: {
            symbol: string;
        };
        paymentToken: {
            symbol: string;
        };
    }>;
};
type TRawOption = TOptionsResponse['markets'][0];

const API: string = 'https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol';
const MS_MULTIPLY: number = 1000;

@Injectable()
export class SirenService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(SirenService.name);
    protected readonly isGetWithPagination: boolean = true;
    protected readonly pageSize: number = 1000;

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(skip: number): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery(skip));

        return rawOptionsResponse.markets;
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        // TODO Implement
        return null;
    }

    protected constructOptionData(rawOption: TRawOption): Option {
        const base: ESymbol = rawOption.paymentToken.symbol as ESymbol;
        const quote: string = rawOption.collateralToken.symbol;
        const type: EOptionType = this.tryExtractType(rawOption.marketName);
        const isPut: boolean = type === EOptionType.PUT;
        const urlFinalPath: string = isPut ? `${base}-${quote}` : `${quote}-${base}`;

        return {
            id: rawOption.id,
            name: rawOption.marketName,
            marketKey: EMarketKey.SIREN,
            marketType: EMarketType.DEX,
            type,
            size: 1,
            strike: this.tryExtractStrike(rawOption.marketName),
            expirationDate: new Date(Number(rawOption.expirationDate) * MS_MULTIPLY),
            base,
            quote,
            strikeAsset: rawOption.paymentToken.symbol,
            marketUrl: 'https://app.sirenmarkets.com/trade/' + urlFinalPath,
            askBase: null,
            askQuote: null,
            bidBase: null,
            bidQuote: null,
            deliveryType: EOptionDeliveryType.DELIVERY,
            styleType: EOptionStyleType.AMERICAN,
        };
    }

    private tryExtractType(marketName: string): EOptionType {
        const elements: Array<string> = marketName.split('.');
        const typeLiteral: string = elements[elements.length - 2];

        if (typeLiteral === 'C') {
            return EOptionType.CALL;
        } else if (typeLiteral === 'P') {
            return EOptionType.PUT;
        } else {
            throw new Error(`${EMarketKey.SIREN} - Option type parsing error - ${marketName}`);
        }
    }

    private tryExtractStrike(marketName: string): number {
        const elements: Array<string> = marketName.split('.');
        const strikeString: string = elements[elements.length - 1].replace(',', '.');
        const strike: number = Number(strikeString);

        if (isNaN(strike)) {
            throw new Error(`${EMarketKey.SIREN} - Option strike parsing error - ${marketName}`);
        }

        return strike;
    }

    private getQuery(skip: number): string {
        const now: number = Math.floor(Date.now() / MS_MULTIPLY);

        return gql`
            {
                markets(where: { expirationDate_gt: ${now} } first: ${this.pageSize} skip: ${skip}) {
                    id
                    marketName
                    expirationDate
                    collateralToken {
                        symbol
                    }
                    paymentToken {
                        symbol
                    }
                }
            }
        `;
    }
}
