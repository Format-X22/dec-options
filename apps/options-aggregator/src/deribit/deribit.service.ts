import { Injectable } from '@nestjs/common';
import { EMarketType, OptionsData } from '@app/shared/options-data.schema';
import { IAggregator } from '../options-aggregator.service';
import * as ccxt from 'ccxt';
import { Dictionary, Exchange, Market } from 'ccxt';

@Injectable()
export class DeribitService implements IAggregator {
    private readonly exchange: Exchange = new ccxt.deribit();

    async getCurrentData(): Promise<Array<OptionsData>> {
        const markets: Dictionary<Market> = await this.exchange.loadMarkets();
        const result: Array<OptionsData> = [];

        for (const [id, data] of Object.entries(markets)) {
            if (data.type === 'option' && data.active) {
                result.push({
                    id,
                    market: 'Deribit',
                    marketType: EMarketType.CEX,
                    type: data.info.option_type.toUpperCase(),
                    size: Number(data.info.contract_size),
                    strike: Number(data.info.strike),
                    expirationDate: new Date(Number(data.info.expiration_timestamp)),
                    base: data.base,
                    quote: data.quote,
                });
            }
        }

        return result;
    }
}
