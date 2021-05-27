import { Injectable } from '@nestjs/common';
import { Option } from '@app/shared/option.schema';
import { IAggregator } from '../options-aggregator.service';
import * as ccxt from 'ccxt';
import { Dictionary, Exchange, Market } from 'ccxt';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

@Injectable()
export class DeribitService implements IAggregator {
    private readonly exchange: Exchange = new ccxt.deribit();

    async getCurrentData(): Promise<Array<Option>> {
        const markets: Dictionary<Market> = await this.exchange.loadMarkets();
        const result: Array<Option> = [];

        for (const [id, data] of Object.entries(markets)) {
            if (!data.active || data.type !== 'option') {
                continue;
            }

            result.push({
                id,
                name: data.symbol,
                marketKey: EMarketKey.DERIBIT,
                marketType: EMarketType.CEX,
                type: data.info.option_type.toUpperCase(),
                size: Number(data.info.contract_size),
                strike: Number(data.info.strike),
                expirationDate: new Date(Number(data.info.expiration_timestamp)),
                base: data.base,
                quote: data.quote,
                strikeAsset: data.base,
                marketUrl: 'https://www.deribit.com/main#/options',
                ask: null, // TODO -
                bid: null, // TODO -
            });
        }

        return result;
    }
}
