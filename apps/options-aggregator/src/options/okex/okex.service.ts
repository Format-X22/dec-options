import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, ESymbol, Option } from '@app/shared/option.schema';
import * as ccxt from 'ccxt';
import { Dictionary, Exchange, Market, OrderBook as CcxtOrderBook } from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook, OrderBookOrder } from '@app/shared/orderbook.schema';

type TOptionMarket = Market & {
    option: boolean;
};

type TRawOption = Dictionary<TOptionMarket>[0];

@Injectable()
export class OkexService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(OkexService.name);
    private readonly exchange: Exchange = new ccxt.okex();

    protected get rateLimit(): number {
        return this.exchange.rateLimit * 2;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const markets: Dictionary<TOptionMarket> = (await this.exchange.loadMarkets()) as Dictionary<TOptionMarket>;

        return Object.values(markets).filter((raw: TRawOption): boolean => raw.option && raw.active);
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        const ccxtOrderBook: CcxtOrderBook = await this.exchange.fetchOrderBook(rawOption.symbol);

        return {
            optionId: rawOption.id,
            optionMarketKey: EMarketKey.OKEX,
            asks: ccxtOrderBook.asks.map(([price, amount]: [number, number]): OrderBookOrder => ({ price, amount })),
            bids: ccxtOrderBook.bids.map(([price, amount]: [number, number]): OrderBookOrder => ({ price, amount })),
        };
    }

    protected constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Option {
        return {
            id: rawOption.id,
            name: rawOption.symbol,
            marketKey: EMarketKey.OKEX,
            marketType: EMarketType.CEX,
            type: this.determinateType(rawOption),
            size: Number(rawOption.info.lot_size),
            strike: Number(rawOption.info.strike),
            expirationDate: new Date(rawOption.info.delivery),
            base: rawOption.base as ESymbol,
            quote: rawOption.quote,
            strikeAsset: rawOption.base,
            marketUrl: 'https://www.okex.com/en/trade-option/' + rawOption.id,
            askBase: null,
            askQuote: orderBook.asks[0]?.price || 0,
            bidBase: null,
            bidQuote: orderBook.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
            fees: {
                makerPercent: rawOption.maker * 100,
                takerPercent: rawOption.taker * 100,
            }
        };
    }

    private determinateType(data: TOptionMarket): EOptionType {
        if (data.info.option_type === 'P') {
            return EOptionType.PUT;
        } else if (data.info.option_type === 'C') {
            return EOptionType.CALL;
        } else {
            throw new Error(`Unknown OKEX option type - ${data.info.option_type} - ${JSON.stringify(data)}`);
        }
    }
}
