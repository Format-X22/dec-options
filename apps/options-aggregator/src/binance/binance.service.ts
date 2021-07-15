import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import * as ccxt from 'ccxt';
import { Exchange } from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook, OrderBookOrder } from '@app/shared/orderbook.schema';

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

type TRawOrderBookOrder = [number, number];
type TRawOrderBook = Array<TRawOrderBookOrder>;
type TOptionsOrderBookResponse = {
    msg: string;
    data: {
        asks: TRawOrderBook;
        bids: TRawOrderBook;
    };
};

@Injectable()
export class BinanceService extends AggregatorAbstract<TRawOption> {
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

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        const depthUrl: string = `${getOptionDepthApiUrl}?symbol=${rawOption.symbol}`;
        const rawDepthResponse: TOptionsOrderBookResponse = await this.exchange.fetch(depthUrl, 'GET');

        if (rawDepthResponse.msg !== 'success') {
            this.throwRequestError('depth', rawDepthResponse);
        }

        const asks: TRawOrderBook = rawDepthResponse.data?.asks || [];
        const bids: TRawOrderBook = rawDepthResponse.data?.bids || [];

        return {
            optionId: rawOption.id,
            optionMarketKey: EMarketKey.BINANCE,
            asks: asks.map(([price, amount]: TRawOrderBookOrder): OrderBookOrder => ({ price, amount })),
            bids: bids.map(([price, amount]: TRawOrderBookOrder): OrderBookOrder => ({ price, amount })),
        };
    }

    protected constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Option {
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
            askBase: null,
            askQuote: orderBook.asks[0]?.price || 0,
            bidBase: null,
            bidQuote: orderBook.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
        };
    }
}
