import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import * as ccxt from 'ccxt';
import { Exchange } from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';

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

type TRawOption = TOptionsResponse['data'][0];

type TOptionsDepthResponse = {
    msg: string;
    data: {
        bids: [[number]];
        asks: [[number]];
    };
};

type TDepth = TOptionsDepthResponse['data'];

@Injectable()
export class BinanceService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(BinanceService.name);
    private readonly exchange: Exchange = new ccxt.binance();

    protected get rateLimit(): number {
        return this.exchange.rateLimit;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const rawOptionsResponse: TOptionsResponse = await this.exchange.fetch(getOptionsApiUrl, 'GET');

        if (rawOptionsResponse.msg !== 'success') {
            this.throwRequestError('options', rawOptionsResponse);
        }

        return rawOptionsResponse.data;
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        const depthUrl: string = `${getOptionDepthApiUrl}?symbol=${rawOption.symbol}`;
        const rawDepthResponse: TOptionsDepthResponse = await this.exchange.fetch(depthUrl, 'GET');

        if (rawDepthResponse.msg !== 'success') {
            this.throwRequestError('depth', rawDepthResponse);
        }

        return rawDepthResponse.data;
    }

    protected constructOptionData(rawOption: TRawOption, depth: TDepth): Option {
        return {
            id: rawOption.id,
            name: rawOption.symbol,
            marketKey: EMarketKey.BINANCE,
            marketType: EMarketType.CEX,
            type: rawOption.side.toUpperCase() as EOptionType,
            size: Number(rawOption.unit),
            strike: Number(rawOption.strikePrice),
            expirationDate: new Date(Number(rawOption.expiryDate)),
            base: rawOption.underlying.replace(rawOption.quoteAsset, ''),
            quote: rawOption.quoteAsset,
            strikeAsset: rawOption.underlying.replace(rawOption.quoteAsset, ''),
            marketUrl: 'https://voptions.binance.com/en',
            askBase: depth.asks?.[0]?.[0] || 0,
            askQuote: null, // TODO -
            askCount: null, // TODO -
            bidBase: depth.bids?.[0]?.[0] || 0, // TODO -
            bidQuote: null, // TODO -
            bidCount: null, // TODO -
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
        };
    }
}
