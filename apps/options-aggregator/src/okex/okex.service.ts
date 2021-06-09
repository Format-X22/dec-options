import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import * as ccxt from 'ccxt';
import { Dictionary, Exchange, Market, OrderBook } from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';

type TOptionMarket = Market & {
    option: boolean;
};

type TRawOption = Dictionary<TOptionMarket>[0];
type TDepth = OrderBook;

@Injectable()
export class OkexService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(OkexService.name);
    private readonly exchange: Exchange = new ccxt.okex();

    protected get rateLimit(): number {
        return this.exchange.rateLimit;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const markets: Dictionary<TOptionMarket> = (await this.exchange.loadMarkets()) as Dictionary<TOptionMarket>;

        return Object.values(markets).filter((raw: TRawOption): boolean => raw.option && raw.active);
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        return await this.exchange.fetchOrderBook(rawOption.symbol);
    }

    protected constructOptionData(rawOption: TRawOption, depth: TDepth): Option {
        return {
            id: rawOption.id,
            name: rawOption.symbol,
            marketKey: EMarketKey.OKEX,
            marketType: EMarketType.CEX,
            type: this.determinateType(rawOption),
            size: Number(rawOption.info.lot_size),
            strike: Number(rawOption.info.strike),
            expirationDate: new Date(rawOption.info.delivery),
            base: rawOption.base,
            quote: rawOption.quote,
            strikeAsset: rawOption.base,
            marketUrl: 'https://www.okex.com/en/trade-option/' + rawOption.id,
            ask: depth.asks?.[0]?.[0] || 0,
            bid: depth.bids?.[0]?.[0] || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
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
