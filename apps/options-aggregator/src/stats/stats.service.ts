import { Injectable, Logger } from '@nestjs/common';
import * as ccxt from 'ccxt';
import * as moment from 'moment';
import { Exchange } from 'ccxt';
import { InjectModel } from '@nestjs/mongoose';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import { EMarketKey } from '@app/shared/market.schema';
import * as sleep from 'sleep-promise';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Stats, StatsDocument } from '@app/shared/stats.schema';

type TOptionNamesWithMeta = Array<{
    name: string;
    base: string;
    expirationDate: Date;
    strike: number;
}>;

type TBinanceCandleResponse = {
    code: string;
    msg: string;
    data:
        | []
        | [
              {
                  volume: string;
              },
          ];
};

type TOkexCandleResponse =
    | []
    | [
          | []
          | [
                string, // Timestamp
                string, // Open
                string, // High
                string, // Low
                string, // Close
                string, // Volume
            ],
      ];

type TOkexInstrumentResponse = {
    open_interest: string;
};

type TCacheItem = {
    base: string;
    marketKey: EMarketKey;
    name: string;
    expirationDate: Date;
    strike: number;
    volume: number;
    openInterest: number;
};

const BINANCE_API = 'https://vapi.binance.com/vapi/v1';
const OKEX_API = 'https://www.okex.com/api/option/v3';
const DERIBIT_API = 'https://www.deribit.com/api/v2';

@Injectable()
export class StatsService {
    private readonly logger: Logger = new Logger(StatsService.name);
    private readonly binanceExchange: Exchange = new ccxt.binance();
    private readonly okexExchange: Exchange = new ccxt.okex();
    private readonly deribitExchange: Exchange = new ccxt.deribit();
    private inProcess: boolean = false;
    private cache: Array<TCacheItem> = [];

    constructor(
        @InjectModel(Option.name) private optionModel: Model<OptionDocument>,
        @InjectModel(Stats.name) private statsModel: Model<StatsDocument>,
    ) {}

    // TODO -
    @Cron(CronExpression.EVERY_MINUTE)
    private async iteration(): Promise<void> {
        if (this.inProcess) {
            return;
        }

        this.inProcess = true;
        this.cache = [];

        try {
            this.logger.log('Trade history sync started');

            const results = await Promise.allSettled([
                this.syncCexStock(EMarketKey.BINANCE, this.syncBinanceOption, this.binanceExchange.rateLimit),
                this.syncCexStock(EMarketKey.OKEX, this.syncOkexOption, this.okexExchange.rateLimit),
                this.syncCexStock(EMarketKey.DERIBIT, this.syncDeribitOption, this.deribitExchange.rateLimit),
            ]);

            this.logger.log('Trade history sync complete');

            for (const result of results) {
                if (result.status === 'rejected') {
                    this.logger.error(result.reason);
                }
            }

            this.logger.log('Stats build started');

            await this.buildStats();

            this.logger.log('Stats build complete');
        } catch (error) {
            this.logger.error(error);
        }

        this.inProcess = false;
    }

    private async syncCexStock(
        marketKey: EMarketKey,
        handler: (data: TOptionNamesWithMeta[0], marketKey: EMarketKey) => Promise<TCacheItem>,
        rateLimit: number,
    ): Promise<void> {
        const namesWithMeta: TOptionNamesWithMeta = await this.extractOptionNamesWithMeta(marketKey);

        for (const data of namesWithMeta) {
            try {
                const result: TCacheItem = await handler.call(this, data, marketKey);

                if (result) {
                    this.cache.push(result);
                }
            } catch (error) {
                // Do nothing
            }

            await sleep(rateLimit * 2);
        }
    }

    private async syncBinanceOption(
        { name, base, expirationDate, strike }: TOptionNamesWithMeta[0],
        marketKey,
    ): Promise<TCacheItem> {
        const candleStartTime: number = moment().startOf('hour').subtract(1, 'hour').valueOf();
        const candleEndTime: number = moment().startOf('hour').subtract(1, 'ms').valueOf();

        const candleResponse: TBinanceCandleResponse = await this.binanceExchange.fetch(
            `${BINANCE_API}/klines?interval=1h&symbol=${name}&startTime=${candleStartTime}&endTime=${candleEndTime}`,
            'GET',
        );

        if (Number(candleResponse.code) !== 0) {
            throw new Error(candleResponse.msg || candleResponse.code);
        }

        if (candleResponse.data.length === 0) {
            return;
        }

        const volume = Number(candleResponse.data[0].volume);

        return {
            name,
            base,
            expirationDate,
            strike,
            volume,
            marketKey,
            openInterest: 0,
        };
    }

    private async syncOkexOption(
        { name, base, expirationDate, strike }: TOptionNamesWithMeta[0],
        marketKey,
    ): Promise<TCacheItem> {
        const candleStartTime: string = moment.utc().startOf('hour').subtract(1, 'hour').toISOString();
        const candleEndTime: string = moment.utc().startOf('hour').subtract(1, 'ms').toISOString();
        const candleResponse: TOkexCandleResponse = await this.okexExchange.fetch(
            `${OKEX_API}/instruments/${name}/candles?granularity=3600&start=${candleStartTime}&end=${candleEndTime}`,
            'GET',
        );

        if (candleResponse.length === 0 || candleResponse[0].length === 0) {
            return;
        }

        const volume = Number(candleResponse[0][5]);

        const instrumentResponse: TOkexInstrumentResponse = await this.okexExchange.fetch(
            `${OKEX_API}/instruments/${base}-USD/summary/${name}`,
            'GET',
        );

        if (!instrumentResponse || !instrumentResponse.open_interest) {
            return;
        }

        const openInterest = Number(instrumentResponse.open_interest);

        return {
            name,
            base,
            expirationDate,
            strike,
            volume,
            marketKey,
            openInterest,
        };
    }

    private async syncDeribitOption(
        { name, base, expirationDate, strike }: TOptionNamesWithMeta[0],
        marketKey,
    ): Promise<TCacheItem> {
        // TODO -
        return;
    }

    private async extractOptionNamesWithMeta(marketKey: EMarketKey): Promise<TOptionNamesWithMeta> {
        const optionNamesModels: Array<OptionDocument> = await this.optionModel.find(
            { marketKey, expirationDate: { $gt: new Date() } },
            { _id: false, name: true, base: true, expirationDate: true, strike: true },
        );

        if (!optionNamesModels) {
            this.logger.warn(`Empty ${marketKey} options collection!`);
            return [];
        }

        return optionNamesModels;
    }

    private async buildStats(): Promise<void> {
        for (const base of await this.getBases()) {
            // TODO -
        }
    }

    private async getBases(): Promise<Array<string>> {
        return this.optionModel.distinct('base');
    }
}
