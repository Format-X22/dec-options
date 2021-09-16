import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { ESymbol, Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { ActiveMarkets } from '@app/shared/market.schema';
import { Stats, StatsDocument } from '@app/shared/stats.schema';

@Injectable()
export class CleanerService implements OnModuleInit {
    private readonly logger: Logger = new Logger(CleanerService.name);

    constructor(
        @InjectModel(Option.name) private optionsModel: Model<OptionDocument>,
        @InjectModel(Stats.name) private statsModel: Model<StatsDocument>,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.cleanInactiveMarketOptions();
        await this.joinDexWithCanonicalBases();
        await this.normalizeImpliedVolatility();
    }

    async cleanInactiveMarketOptions(): Promise<void> {
        await this.optionsModel.deleteMany({ marketKey: { $nin: ActiveMarkets } });
        this.logger.verbose('Options from inactive markets cleaned');
    }

    async joinDexWithCanonicalBases(): Promise<void> {
        await this.optionsModel.updateMany({ base: ESymbol.WETH }, { $set: { base: ESymbol.ETH } });
        await this.optionsModel.updateMany({ base: ESymbol.WBTC }, { $set: { base: ESymbol.BTC } });
    }

    async normalizeImpliedVolatility(): Promise<void> {
        await this.statsModel.updateMany(
            {},
            { $set: { 'details.$[huge].impliedVolatility': 1 } },
            { arrayFilters: [{ 'huge.impliedVolatility': { $gt: 1000 } }] },
        );
    }

    @Cron(CronExpression.EVERY_4_HOURS)
    async cleanOldOptions(): Promise<void> {
        // Buffer for users with old option on screen
        const dayAgo: Date = moment().subtract(1, 'days').toDate();

        await this.optionsModel.deleteMany({ expirationDate: { $lt: dayAgo } });
        this.logger.verbose('Old options cleaned');
    }
}
