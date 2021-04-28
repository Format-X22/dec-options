import { Injectable } from '@nestjs/common';
import { EMarket, EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { IAggregator } from '../options-aggregator.service';
import * as ccxt from 'ccxt';
import { Dictionary, Exchange, Market } from 'ccxt';

type TOptionMarket = Market & {
    option: boolean;
};

@Injectable()
export class OkexService implements IAggregator {
    private readonly exchange: Exchange = new ccxt.okex();

    async getCurrentData(): Promise<Array<OptionsData>> {
        const markets: Dictionary<TOptionMarket> = (await this.exchange.loadMarkets()) as Dictionary<TOptionMarket>;
        const result: Array<OptionsData> = [];

        for (const [id, data] of Object.entries(markets)) {
            if (!data.active || !data.option) {
                continue;
            }

            result.push({
                id,
                market: EMarket.OKEX,
                marketType: EMarketType.CEX,
                type: this.determinateType(data),
                size: Number(data.info.lot_size),
                strike: Number(data.info.strike),
                expirationDate: new Date(data.info.delivery),
                base: data.base,
                quote: data.quote,
            });
        }

        return result;
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