import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';

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
type TDepth = Object;

const API: string = 'https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol';
const QUERY: string = gql`
    {
        markets {
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
const MS_MULTIPLY: number = 1000;

@Injectable()
export class SirenService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(SirenService.name);

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, QUERY);

        return rawOptionsResponse.markets;
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        return {}; // TODO -
    }

    protected constructOptionData(rawOption: TRawOption, depth: TDepth): Option {
        const base: string = rawOption.paymentToken.symbol;
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
            askBase: null, // TODO -
            askQuote: null, // TODO -
            bidBase: null, // TODO -
            bidQuote: null, // TODO -
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
}
