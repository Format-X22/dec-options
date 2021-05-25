import { Injectable } from '@nestjs/common';
import { EOptionType, Option } from '@app/shared/option.schema';
import { IAggregator } from '../options-aggregator.service';
import { Exchange } from 'ccxt';
import * as ccxt from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

const GetOptionsApiUrl: string = 'https://vapi.binance.com/vapi/v1/optionInfo';

type TOptionsResponse = {
    msg: string;
    data: Array<{
        id: string;
        symbol: string;
        side: string;
        unit: string;
        strikePrice: string;
        expiryDate: string;
        underlying: string;
        quoteAsset: string;
    }>;
};

@Injectable()
export class BinanceService implements IAggregator {
    private readonly exchange: Exchange = new ccxt.binance();

    async getCurrentData(): Promise<Array<Option>> {
        const rawOptionsResponse: TOptionsResponse = await this.exchange.fetch(GetOptionsApiUrl, 'GET');

        if (rawOptionsResponse.msg !== 'success') {
            throw new Error(`Invalid BINANCE response - ${JSON.stringify(rawOptionsResponse, null, 2)}`);
        }

        return rawOptionsResponse.data.map(
            (data: TOptionsResponse['data'][0]): Option => {
                return {
                    id: data.id,
                    name: data.symbol,
                    marketKey: EMarketKey.BINANCE,
                    marketType: EMarketType.CEX,
                    type: data.side.toUpperCase() as EOptionType,
                    size: Number(data.unit),
                    strike: Number(data.strikePrice),
                    expirationDate: new Date(Number(data.expiryDate)),
                    base: data.underlying.replace(data.quoteAsset, ''),
                    quote: data.quoteAsset,
                    strikeAsset: data.underlying.replace(data.quoteAsset, ''),
                    marketUrl: 'https://voptions.binance.com/en',
                };
            },
        );
    }
}
