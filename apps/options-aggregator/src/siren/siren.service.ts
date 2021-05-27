import { Injectable } from '@nestjs/common';
import { EOptionType, Option } from '@app/shared/option.schema';
import { IAggregator } from '../options-aggregator.service';
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
export class SirenService implements IAggregator {
    async getCurrentData(): Promise<Array<Option>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, QUERY);

        return rawOptionsResponse.markets.map(
            (data: TOptionsResponse['markets'][0]): Option => {
                const base: string = data.paymentToken.symbol;
                const quote: string = data.collateralToken.symbol;
                const type: EOptionType = this.tryExtractType(data.marketName);
                const isPut: boolean = type === EOptionType.PUT;
                const urlFinalPath: string = isPut ? `${base}-${quote}` : `${quote}-${base}`;

                return {
                    id: data.id,
                    name: data.marketName,
                    marketKey: EMarketKey.SIREN,
                    marketType: EMarketType.DEX,
                    type,
                    size: 1,
                    strike: this.tryExtractStrike(data.marketName),
                    expirationDate: new Date(Number(data.expirationDate) * MS_MULTIPLY),
                    base,
                    quote,
                    strikeAsset: data.paymentToken.symbol,
                    marketUrl: 'https://app.sirenmarkets.com/trade/' + urlFinalPath,
                    price: null, // TODO -
                };
            },
        );
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
        const strikeString: string = elements[elements.length - 1];
        const strike: number = Number(strikeString);

        if (isNaN(strike)) {
            throw new Error(`${EMarketKey.SIREN} - Option strike parsing error - ${marketName}`);
        }

        return strike;
    }
}
