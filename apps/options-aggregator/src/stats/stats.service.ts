import { Injectable, Logger } from '@nestjs/common';
import * as ccxt from 'ccxt';
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

@Injectable()
export class StatsService {
    private readonly logger: Logger = new Logger(StatsService.name);
    private readonly binanceExchange: Exchange = new ccxt.binance();
    private readonly okexExchange: Exchange = new ccxt.okex();
    private readonly deribitExchange: Exchange = new ccxt.deribit();
    private inProcess: boolean = false;

    constructor(
        @InjectModel(Option.name) private optionModel: Model<OptionDocument>,
        @InjectModel(Stats.name) private statsModel: Model<StatsDocument>,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    private async iteration(): Promise<void> {
        if (this.inProcess) {
            return;
        }

        this.inProcess = true;

        try {
            const results = await Promise.allSettled([
                this.syncCexStock(EMarketKey.BINANCE, this.syncBinanceOption, this.binanceExchange.rateLimit),
                this.syncCexStock(EMarketKey.OKEX, this.syncOkexOption, this.okexExchange.rateLimit),
                this.syncCexStock(EMarketKey.DERIBIT, this.syncDeribitOption, this.deribitExchange.rateLimit),
            ]);

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

        this.inProcess = false;
    }

    private async syncCexStock(marketKey: EMarketKey, handler: Function, rateLimit: number): Promise<void> {
        const namesWithMeta: TOptionNamesWithMeta = await this.extractOptionNamesWithMeta(marketKey);

        for (const data of namesWithMeta) {
            try {
                await handler.call(this, data);
            } catch (error) {
                // Do nothing
            }

            await sleep(rateLimit * 2);
        }
    }

    private async syncBinanceOption({ name, base, expirationDate, strike }: TOptionNamesWithMeta[0]): Promise<void> {
        // TODO -
    }

    private async syncOkexOption({ name, base, expirationDate, strike }: TOptionNamesWithMeta[0]): Promise<void> {
        // TODO -
    }

    private async syncDeribitOption({ name, base, expirationDate, strike }: TOptionNamesWithMeta[0]): Promise<void> {
        // TODO -
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
