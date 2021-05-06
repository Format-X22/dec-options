import { Injectable } from '@nestjs/common';
import { EMarket, EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { IAggregator } from '../options-aggregator.service';
import { gql, request } from 'graphql-request';

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
    async getCurrentData(): Promise<Array<OptionsData>> {
        const rawOptionsResponse: TOptionsResponse = await request(API, QUERY);

        return rawOptionsResponse.markets.map(
            (data: TOptionsResponse['markets'][0]): OptionsData => {
                return {
                    id: data.id,
                    name: data.marketName,
                    market: EMarket.SIREN,
                    marketType: EMarketType.DEX,
                    type: this.tryExtractType(data.marketName),
                    size: 1,
                    strike: this.tryExtractStrike(data.marketName),
                    expirationDate: new Date(Number(data.expirationDate) * MS_MULTIPLY),
                    base: data.paymentToken.symbol,
                    quote: data.collateralToken.symbol,
                    strikeAsset: data.paymentToken.symbol,
                    marketUrl: null,
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
            throw new Error(`${EMarket.SIREN} - Option type parsing error - ${marketName}`);
        }
    }

    private tryExtractStrike(marketName: string): number {
        const elements: Array<string> = marketName.split('.');
        const strikeString: string = elements[elements.length - 1];
        const strike: number = Number(strikeString);

        if (isNaN(strike)) {
            throw new Error(`${EMarket.SIREN} - Option strike parsing error - ${marketName}`);
        }

        return strike;
    }
}
