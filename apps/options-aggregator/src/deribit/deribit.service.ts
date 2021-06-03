import { Injectable, Logger } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, Option } from '@app/shared/option.schema';
import * as ccxt from 'ccxt';
import { Dictionary, Exchange, Market, OrderBook } from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';

type TRawOption = Dictionary<Market>[0];
type TDepth = OrderBook;

@Injectable()
export class DeribitService extends AggregatorAbstract<TRawOption, TDepth> {
    protected readonly logger: Logger = new Logger(DeribitService.name);
    private readonly exchange: Exchange = new ccxt.deribit();

    protected get rateLimit(): number {
        return this.exchange.rateLimit;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        const markets: Dictionary<Market> = await this.exchange.loadMarkets();

        return Object.values(markets).filter((raw: TRawOption): boolean => raw.type === 'option' && raw.active);
    }

    protected async getDepth(rawOption: TRawOption): Promise<TDepth> {
        return await this.exchange.fetchOrderBook(rawOption.symbol);
    }

    protected constructOptionData(rawOption: TRawOption, depth: TDepth): Option {
        return {
            id: rawOption.id,
            name: rawOption.symbol,
            marketKey: EMarketKey.DERIBIT,
            marketType: EMarketType.CEX,
            type: rawOption.info.option_type.toUpperCase(),
            size: Number(rawOption.info.contract_size),
            strike: Number(rawOption.info.strike),
            expirationDate: new Date(Number(rawOption.info.expiration_timestamp)),
            base: rawOption.base,
            quote: rawOption.quote,
            strikeAsset: rawOption.base,
            marketUrl: 'https://www.deribit.com/main#/options',
            ask: depth.asks?.[0]?.[0] || 0,
            bid: depth.bids?.[0]?.[0] || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
        };
    }
}
