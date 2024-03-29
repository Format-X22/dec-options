import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, ESymbol, Option } from '@app/shared/option.schema';
import * as ccxt from 'ccxt';
import { Dictionary, Exchange, Market, OrderBook as CcxtOrderBook } from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook, OrderBookOrder } from '@app/shared/orderbook.schema';

type TRawOption = Dictionary<Market>[0] & {
    info: {
        maker_commission: string;
        taker_commission: string;
    };
};

@Injectable()
export class DeribitService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(DeribitService.name);
    private readonly exchange: Exchange = new ccxt.deribit();

    protected get rateLimit(): number {
        return this.exchange.rateLimit * 2;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const markets: Dictionary<Market> = await this.exchange.loadMarkets();

        return Object.values(markets).filter((raw: TRawOption): boolean => raw.type === 'option' && raw.active);
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        const ccxtOrderBook: CcxtOrderBook = await this.exchange.fetchOrderBook(rawOption.symbol);
        const asks: Array<OrderBookOrder> = [];
        const bids: Array<OrderBookOrder> = [];

        for (const [rawPrice, amount] of ccxtOrderBook.asks) {
            const basePrice: number = await this.priceService.getPrice(rawOption.base as ESymbol);
            const price: number = basePrice * rawPrice;

            asks.push({ price, amount });
        }

        for (const [rawPrice, amount] of ccxtOrderBook.bids) {
            const basePrice: number = await this.priceService.getPrice(rawOption.base as ESymbol);
            const price: number = basePrice * rawPrice;

            bids.push({ price, amount });
        }

        return {
            optionId: rawOption.id,
            optionMarketKey: EMarketKey.DERIBIT,
            asks,
            bids,
        };
    }

    protected constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Option {
        return {
            id: rawOption.id,
            name: rawOption.symbol,
            marketKey: EMarketKey.DERIBIT,
            marketType: EMarketType.CEX,
            type: rawOption.info.option_type.toUpperCase(),
            size: Number(rawOption.info.contract_size),
            strike: Number(rawOption.info.strike),
            expirationDate: new Date(Number(rawOption.info.expiration_timestamp)),
            base: rawOption.base as ESymbol,
            quote: rawOption.quote,
            strikeAsset: rawOption.base,
            marketUrl: 'https://www.deribit.com/main#/options',
            askBase: null,
            askQuote: orderBook.asks[0]?.price || 0,
            bidBase: null,
            bidQuote: orderBook.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
            fees: {
                makerPercent: Number(rawOption.info.maker_commission) * 100,
                takerPercent: Number(rawOption.info.taker_commission) * 100,
            },
        };
    }
}
