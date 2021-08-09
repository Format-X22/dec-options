import { Injectable, Logger } from '@nestjs/common';
import * as ccxt from 'ccxt';
import * as iv from 'implied-volatility';
import * as moment from 'moment';
import { Exchange } from 'ccxt';
import { InjectModel } from '@nestjs/mongoose';
import { EOptionType, ESymbol, Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import { EMarketKey } from '@app/shared/market.schema';
import * as sleep from 'sleep-promise';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Stats, StatsDocument, StatsDetails } from '@app/shared/stats.schema';
import { PriceService } from '../price/price.service';

type TOptionNamesWithMeta = Array<{
    name: string;
    base: ESymbol;
    expirationDate: Date;
    strike: number;
    type: EOptionType;
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

type TBinanceInstrumentResponse = {
    code: string;
    msg: string;
    data: [
        {
            askPrice: string;
            bidPrice: string;
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
    best_ask: string;
    best_bid: string;
};

type TDeribitCandleResponse = {
    result: {
        status: string;
        volume: [number];
    };
};

type TDeribitInstrumentResponse = {
    result: [
        {
            open_interest: string;
            bid_price: string;
            ask_price: string;
        },
    ];
};

type TCacheItem = {
    base: string;
    marketKey: EMarketKey;
    name: string;
    expirationDate: Date;
    strike: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
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
        private priceService: PriceService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    private async iteration(): Promise<void> {
        if (this.inProcess) {
            return;
        }

        this.inProcess = true;
        this.cache = [];

        try {
            this.logger.verbose('Trade history sync started');

            const results = await Promise.allSettled([
                this.syncCexStock(EMarketKey.BINANCE, this.syncBinanceOption, this.binanceExchange.rateLimit),
                this.syncCexStock(EMarketKey.OKEX, this.syncOkexOption, this.okexExchange.rateLimit),
                this.syncCexStock(EMarketKey.DERIBIT, this.syncDeribitOption, this.deribitExchange.rateLimit),
            ]);

            this.logger.verbose('Trade history sync complete');

            for (const result of results) {
                if (result.status === 'rejected') {
                    this.logger.error(result.reason);
                }
            }

            this.logger.verbose('Stats build started');

            await this.buildStats();

            this.logger.verbose('Stats build complete');
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
                this.logger.error(error);
            }

            await sleep(rateLimit * 2);
        }
    }

    private async syncBinanceOption(
        { name, base, expirationDate, strike, type }: TOptionNamesWithMeta[0],
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

        const instrumentResponse: TBinanceInstrumentResponse = await this.binanceExchange.fetch(
            `${BINANCE_API}/ticker?symbol=${name}`,
            'GET',
        );
        const data = instrumentResponse.data[0];
        const impliedVolatility = await this.calcImpliedVolatility({
            minAsk: Number(data.askPrice),
            maxBid: Number(data.bidPrice),
            base,
            expirationDate,
            strike,
            type,
        });

        return {
            name,
            base,
            expirationDate,
            strike,
            volume,
            marketKey,
            openInterest: 0,
            impliedVolatility,
        };
    }

    private async syncOkexOption(
        { name, base, expirationDate, strike, type }: TOptionNamesWithMeta[0],
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

        const volume = Number(candleResponse[0][5]) || 0;

        const instrumentResponse: TOkexInstrumentResponse = await this.okexExchange.fetch(
            `${OKEX_API}/instruments/${base}-USD/summary/${name}`,
            'GET',
        );

        if (!instrumentResponse || !instrumentResponse.open_interest) {
            return;
        }

        const openInterest = Number(instrumentResponse.open_interest) || 0;
        const impliedVolatility = await this.calcImpliedVolatility({
            strike,
            base,
            expirationDate,
            type,
            minAsk: Number(instrumentResponse.best_ask),
            maxBid: Number(instrumentResponse.best_bid),
        });

        return {
            name,
            base,
            expirationDate,
            strike,
            volume,
            marketKey,
            openInterest,
            impliedVolatility,
        };
    }

    private async syncDeribitOption(
        { name, base, expirationDate, strike, type }: TOptionNamesWithMeta[0],
        marketKey,
    ): Promise<TCacheItem> {
        const candleStartTime: number = moment().startOf('hour').subtract(1, 'hour').valueOf();
        const candleEndTime: number = moment().startOf('hour').valueOf();

        const candleResponse: TDeribitCandleResponse = await this.deribitExchange.fetch(
            `${DERIBIT_API}/public/get_tradingview_chart_data?resolution=60` +
                `&instrument_name=${name}&start_timestamp=${candleStartTime}&end_timestamp=${candleEndTime}`,
            'GET',
        );

        let volume = 0;

        if (candleResponse.result.status === 'ok') {
            volume += Number(candleResponse.result.volume[0]) || 0;
        }

        const instrumentResponse: TDeribitInstrumentResponse = await this.deribitExchange.fetch(
            `${DERIBIT_API}/public/get_book_summary_by_instrument?instrument_name=${name}`,
            'GET',
        );

        const openInterest: number = Number(instrumentResponse.result[0].open_interest) || 0;
        const data = instrumentResponse.result[0];
        const impliedVolatility = await this.calcImpliedVolatility({
            minAsk: Number(data.ask_price) || 0,
            maxBid: Number(data.bid_price) || 0,
            strike,
            base,
            expirationDate,
            type,
        });

        return {
            name,
            base,
            expirationDate,
            strike,
            volume,
            marketKey,
            openInterest,
            impliedVolatility,
        };
    }

    private async extractOptionNamesWithMeta(marketKey: EMarketKey): Promise<TOptionNamesWithMeta> {
        const optionNamesModels: Array<OptionDocument> = await this.optionModel.find(
            { marketKey, expirationDate: { $gt: new Date() } },
            { _id: false, name: true, base: true, expirationDate: true, strike: true, type: true },
        );

        if (!optionNamesModels) {
            this.logger.warn(`Empty ${marketKey} options collection!`);
            return [];
        }

        return optionNamesModels;
    }

    private async buildStats(): Promise<void> {
        for (const base of await this.getBases()) {
            for (const marketKey of Object.values(EMarketKey)) {
                const cached = this.cache.filter((item) => item.base === base && item.marketKey === marketKey);

                await this.buildStatsFor(base, marketKey, cached);
            }
        }
    }

    private async buildStatsFor(base: string, marketKey: EMarketKey, items: Array<TCacheItem>): Promise<void> {
        let volume = 0;
        let openInterest = 0;
        const details: Array<StatsDetails> = [];

        for (const item of items) {
            volume += item.volume;
            openInterest += item.openInterest;

            let currentDetails = details.find(
                (resultItem) => resultItem.expirationDate === item.expirationDate && resultItem.strike === item.strike,
            );

            if (!currentDetails) {
                currentDetails = {
                    expirationDate: item.expirationDate,
                    strike: item.strike,
                    openInterest: 0,
                    volume: 0,
                    impliedVolatility: 0,
                    impliedVolatilityCount: 0,
                };

                details.push(currentDetails);
            }

            currentDetails.volume += volume;
            currentDetails.openInterest += openInterest;

            const IVSumPart = currentDetails.impliedVolatility / currentDetails.impliedVolatilityCount || 0;
            const nextCount = ++currentDetails.impliedVolatilityCount;

            currentDetails.impliedVolatility = (IVSumPart + item.impliedVolatility) / nextCount;
        }

        await this.statsModel.create({
            volume,
            openInterest,
            details,
            base,
            marketKey,
            date: moment.utc().startOf('hour').toDate(),
        });
    }

    private async getBases(): Promise<Array<string>> {
        return this.optionModel.distinct('base');
    }

    private async calcImpliedVolatility({
        minAsk,
        maxBid,
        strike,
        expirationDate,
        type,
        base,
    }: {
        minAsk: number;
        maxBid: number;
        strike: number;
        expirationDate: Date;
        type: EOptionType;
        base: ESymbol;
    }): Promise<number> {
        const currentPrice = await this.priceService.getPrice(base);

        minAsk = minAsk > currentPrice * 0.9 ? minAsk : minAsk * currentPrice;
        maxBid = maxBid > currentPrice * 0.9 ? maxBid : maxBid * currentPrice;

        const optionPrice = maxBid ? Math.abs(maxBid + minAsk) / 2 : minAsk;
        const datesDifference = Math.abs(moment(expirationDate).diff(new Date(), 'days') + 1) / 365;

        return iv.getImpliedVolatility(optionPrice, currentPrice, strike, datesDifference, 0, type.toLowerCase());
    }
}
