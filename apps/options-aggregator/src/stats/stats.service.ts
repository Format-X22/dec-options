import { Injectable, Logger } from '@nestjs/common';
import * as ccxt from 'ccxt';
import { Exchange } from 'ccxt';
import * as moment from 'moment';
import { InjectModel } from '@nestjs/mongoose';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import { EMarketKey } from '@app/shared/market.schema';
import * as sleep from 'sleep-promise';
import { ESide, TradeHistory, TradeHistoryDocument } from '@app/shared/trade-history.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Stats, StatsDocument } from '@app/shared/stats.schema';

type TOptionNamesWithMeta = Array<{
    name: string;
    base: string;
    expirationDate: Date;
    strike: number;
}>;

type TBinanceTradesResponse = {
    code: string;
    msg: string;
    data: Array<{
        price: string;
        qty: string;
        quoteQty: string;
        time: string;
        side: '1' | '-1';
    }>;
};

type TOkexTradesResponse = Array<{
    price: string;
    qty: string;
    side: 'buy' | 'sell';
    timestamp: string;
    trade_id: string;
}>;

type TDeribitTradesResponse = {
    error?: string;
    result?: {
        trades: Array<{
            trade_seq: string;
            timestamp: string;
            price: string;
            amount: string;
            direction: 'buy' | 'sell';
        }>;
    };
};

@Injectable()
export class StatsService {
    private readonly logger: Logger = new Logger(StatsService.name);
    private readonly binanceExchange: Exchange = new ccxt.binance();
    private readonly okexExchange: Exchange = new ccxt.okex();
    private readonly deribitExchange: Exchange = new ccxt.deribit();

    constructor(
        @InjectModel(Option.name) private optionModel: Model<OptionDocument>,
        @InjectModel(TradeHistory.name) private tradeHistoryModel: Model<TradeHistoryDocument>,
        @InjectModel(Stats.name) private statsModel: Model<StatsDocument>,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    private async iteration(): Promise<void> {
        try {
            const results = await Promise.allSettled([this.syncBinance(), this.syncDeribit(), this.syncOkex()]);

            this.logger.log('Trade history sync started');

            for (const result of results) {
                if (result.status === 'rejected') {
                    this.logger.error(result.reason);
                }
            }

            this.logger.log('Trade history sync complete');
            this.logger.log('Stats build started');

            await this.buildStats();

            this.logger.log('Stats build complete');
        } catch (error) {
            this.logger.error(error);
        }
    }

    private async syncBinance(): Promise<void> {
        const namesWithMeta: TOptionNamesWithMeta = await this.extractOptionNamesWithMeta(EMarketKey.BINANCE);

        for (const data of namesWithMeta) {
            try {
                await this.syncBinanceOption(data);
            } catch (error) {
                // Do nothing
            }

            await sleep(this.binanceExchange.rateLimit * 2);
        }
    }

    private async syncBinanceOption(
        { name, base, expirationDate, strike }: TOptionNamesWithMeta[0],
        fromId: string = '',
    ): Promise<void> {
        const tradesResponse: TBinanceTradesResponse = await this.binanceExchange.fetch(
            `https://vapi.binance.com/vapi/v1/historicalTrades?limit=100&symbol=${name}&fromId=${fromId}`,
            'GET',
        );

        if (Number(tradesResponse.code) !== 0) {
            throw new Error(tradesResponse.msg || tradesResponse.code);
        }

        if (tradesResponse.data[0].time === fromId) {
            return;
        }

        for (const rawTrade of tradesResponse.data) {
            const marketKey = EMarketKey.BINANCE;
            const timestamp = Number(rawTrade.time);

            await this.tradeHistoryModel.updateOne(
                { marketKey, timestamp },
                {
                    $set: {
                        optionName: name,
                        base,
                        expirationDate,
                        strike,
                        marketKey,
                        timestamp,
                        price: Number(rawTrade.price),
                        baseQty: Number(rawTrade.qty),
                        quoteQty: Number(rawTrade.quoteQty),
                        side: Number(rawTrade.side) === 1 ? ESide.BUY : ESide.SELL,
                    },
                },
                { upsert: true },
            );
        }

        if (tradesResponse.data.length > 0) {
            await sleep(this.binanceExchange.rateLimit * 2);
            await this.syncBinanceOption({ name, base, expirationDate, strike }, tradesResponse.data[0].time);
        }
    }

    private async syncOkex(): Promise<void> {
        const namesWithBase: TOptionNamesWithMeta = await this.extractOptionNamesWithMeta(EMarketKey.OKEX);

        for (const data of namesWithBase) {
            try {
                await this.syncOkexOption(data);
            } catch (error) {
                // Do nothing
            }

            await sleep(this.okexExchange.rateLimit * 2);
        }
    }

    private async syncOkexOption(
        { name, base, expirationDate, strike }: TOptionNamesWithMeta[0],
        before: string = '',
    ): Promise<void> {
        const tradesResponse: TOkexTradesResponse = await this.okexExchange.fetch(
            `https://www.okex.com/api/option/v3/instruments/${name}/trades?before=${before}`,
            'GET',
        );

        if (tradesResponse.length === 0) {
            return;
        }

        for (const rawTrade of tradesResponse) {
            const marketKey = EMarketKey.OKEX;
            const timestamp = Number(new Date(rawTrade.timestamp));

            await this.tradeHistoryModel.updateOne(
                { marketKey, timestamp },
                {
                    $set: {
                        optionName: name,
                        base,
                        expirationDate,
                        strike,
                        marketKey,
                        timestamp,
                        price: Number(rawTrade.price),
                        baseQty: Number(rawTrade.qty),
                        quoteQty: null,
                        side: rawTrade.side === 'buy' ? ESide.BUY : ESide.SELL,
                    },
                },
                { upsert: true },
            );
        }

        await sleep(this.okexExchange.rateLimit * 2);
        await this.syncOkexOption({ name, base, expirationDate, strike }, tradesResponse[0].trade_id);
    }

    private async syncDeribit(): Promise<void> {
        const namesWithMeta: TOptionNamesWithMeta = await this.extractOptionNamesWithMeta(EMarketKey.DERIBIT);

        for (const data of namesWithMeta) {
            try {
                await this.syncDeribitOption(data);
            } catch (error) {
                // Do nothing
            }

            await sleep(this.deribitExchange.rateLimit * 2);
        }
    }

    private async syncDeribitOption(
        { name, base, expirationDate, strike }: TOptionNamesWithMeta[0],
        start: string = '0',
    ): Promise<void> {
        const tradesResponse: TDeribitTradesResponse = await this.deribitExchange.fetch(
            'https://test.deribit.com/api/v2/public/get_last_trades_by_instrument' +
                `?include_old=true&sorting=ask&instrument_name=${name}&start_seq=${start}&count=2`,
            'GET',
        );

        if (tradesResponse.error || !tradesResponse.result) {
            throw new Error(tradesResponse.error || 'Invalid result data');
        }

        const trades = tradesResponse.result.trades;

        if (trades.length === 0) {
            return;
        }

        for (const rawTrade of trades) {
            const marketKey = EMarketKey.DERIBIT;
            const timestamp = Number(rawTrade.timestamp);

            await this.tradeHistoryModel.updateOne(
                { marketKey, timestamp },
                {
                    $set: {
                        optionName: name,
                        expirationDate,
                        strike,
                        marketKey,
                        timestamp,
                        price: Number(rawTrade.price),
                        baseQty: Number(rawTrade.amount),
                        quoteQty: null,
                        side: rawTrade.direction === 'buy' ? ESide.BUY : ESide.SELL,
                    },
                },
                { upsert: true },
            );
        }

        await sleep(this.deribitExchange.rateLimit * 2);
        await this.syncDeribitOption(
            { name, base, expirationDate, strike },
            String(Number(trades[trades.length - 1].trade_seq) + 1),
        );
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
            const history: Array<TradeHistory> = await this.tradeHistoryModel.find(
                {
                    timestamp: {
                        $gt: Number(moment().subtract(1, 'hour')),
                        $lte: Date.now(),
                    },
                },
                { _id: false, baseQty: true, side: true, expirationDate: true },
            );

            if (!history.length) {
                this.logger.warn('Empty stats data');
                return;
            }

            let volume = 0;
            let openInterestChanges = 0;
            let oiByDates = new Map<Date, Map<number, number>>();

            for (const data of history) {
                if (!oiByDates.has(data.expirationDate)) {
                    oiByDates.set(data.expirationDate, new Map());
                }

                const oiByExp = oiByDates.get(data.expirationDate);

                if (!oiByExp.has(data.strike)) {
                    oiByExp.set(data.strike, 0);
                }

                volume += data.baseQty;

                let oiChanges;

                if (data.side === ESide.BUY) {
                    oiChanges = data.baseQty;
                } else {
                    oiChanges = -data.baseQty;
                }

                openInterestChanges += oiChanges;
                oiByExp.set(data.strike, oiByExp.get(data.strike) + oiChanges);
            }

            const openInterestDetails: Stats['openInterestDetails'] = Array.from(oiByDates)
                .map(([expirationDate, oiByExp]) =>
                    Array.from(oiByExp).map(([strike, openInterestChanges]) => ({
                        expirationDate,
                        strike,
                        openInterestChanges,
                    })),
                )
                .flat();

            await this.statsModel.create({
                base,
                date: new Date(),
                volume,
                openInterestChanges,
                openInterestDetails,
            });
        }
    }

    private async getBases(): Promise<Array<string>> {
        return this.optionModel.distinct('base');
    }
}
