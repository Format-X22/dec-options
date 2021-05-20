import { Injectable } from '@nestjs/common';
import { EMarket, EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { IAggregator } from '../options-aggregator.service';
import { Exchange } from 'ccxt';
import * as ccxt from 'ccxt';

type TOptionsResponse = {
    success: boolean;
    result?: Array<{
        option: {
            underlying: string;
            type: string;
            strike: string;
            expiry: string;
        };
    }>;
};

@Injectable()
export class FtxService implements IAggregator {
    private readonly exchange: Exchange = new ccxt.ftx();

    async getCurrentData(): Promise<Array<OptionsData>> {
        const rawOptionsResponse: TOptionsResponse = await this.exchange.publicGetOptionsRequests();

        if (!rawOptionsResponse.success) {
            throw new Error(`Invalid FTX response - ${JSON.stringify(rawOptionsResponse, null, 2)}`);
        }

        return rawOptionsResponse.result.map(
            (data: TOptionsResponse['result'][0]): OptionsData => {
                return {
                    id: data.option.expiry,
                    name: data.option.expiry,
                    market: null, // EMarket.FTX
                    marketType: EMarketType.CEX,
                    type: data.option.type.toUpperCase() as EOptionType,
                    size: 0.0001,
                    strike: Number(data.option.strike),
                    expirationDate: new Date(data.option.expiry),
                    base: data.option.underlying,
                    quote: 'USD',
                    strikeAsset: data.option.underlying,
                    marketUrl: 'https://ftx.com/options',
                };
            },
        );
    }
}
