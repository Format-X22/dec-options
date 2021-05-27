import { Injectable } from '@nestjs/common';
import { EOptionType, Option } from '@app/shared/option.schema';
import { IAggregator } from '../options-aggregator.service';
import { Exchange } from 'ccxt';
import * as ccxt from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

const getOptionsApiUrl: string = 'https://vapi.binance.com/vapi/v1/optionInfo';
const getOptionDepthApiUrl: string = 'https://vapi.binance.com/vapi/v1/depth';

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

type TOptionsDepthResponse = {
    msg: string;
    data: {
        bids: [[number]];
        asks: [[number]];
    };
};

@Injectable()
export class BinanceService implements IAggregator {
    private readonly exchange: Exchange = new ccxt.binance();

    async getCurrentData(): Promise<Array<Option>> {
        const rawOptionsResponse: TOptionsResponse = await this.exchange.fetch(getOptionsApiUrl, 'GET');

        if (rawOptionsResponse.msg !== 'success') {
            this.throwRequestError('options', rawOptionsResponse);
        }

        const result: Array<Option> = [];

        for (const raw of rawOptionsResponse.data) {
            const depthUrl: string = `${getOptionDepthApiUrl}?symbol=${raw.symbol}`;
            const rawDepthResponse: TOptionsDepthResponse = await this.exchange.fetch(depthUrl, 'GET');

            if (rawDepthResponse.msg !== 'success') {
                this.throwRequestError('depth', rawDepthResponse);
            }

            result.push({
                id: raw.id,
                name: raw.symbol,
                marketKey: EMarketKey.BINANCE,
                marketType: EMarketType.CEX,
                type: raw.side.toUpperCase() as EOptionType,
                size: Number(raw.unit),
                strike: Number(raw.strikePrice),
                expirationDate: new Date(Number(raw.expiryDate)),
                base: raw.underlying.replace(raw.quoteAsset, ''),
                quote: raw.quoteAsset,
                strikeAsset: raw.underlying.replace(raw.quoteAsset, ''),
                marketUrl: 'https://voptions.binance.com/en',
                ask: rawDepthResponse.data.asks?.[0]?.[0] || 0,
                bid: rawDepthResponse.data.bids?.[0]?.[0] || 0,
            });
        }

        return result;
    }

    throwRequestError(source: string, data: Object): never {
        throw new Error(`Invalid BINANCE response - ${source} - ${JSON.stringify(data, null, 2)}`);
    }
}
