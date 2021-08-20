import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { ActiveMarkets } from '@app/shared/market.schema';

@Injectable()
export class CleanerService implements OnModuleInit {
    private readonly logger: Logger = new Logger(CleanerService.name);

    constructor(@InjectModel(Option.name) private optionsModel: Model<OptionDocument>) {}

    async onModuleInit(): Promise<void> {
        await this.cleanInactiveMarketOptions();
    }

    async cleanInactiveMarketOptions(): Promise<void> {
        await this.optionsModel.deleteMany({ marketKey: { $nin: ActiveMarkets } });
        this.logger.verbose('Options from inactive markets cleaned');
    }

    @Cron(CronExpression.EVERY_4_HOURS)
    async cleanOldOptions(): Promise<void> {
        // Buffer for users with old option on screen
        const dayAgo: Date = moment().subtract(1, 'days').toDate();

        await this.optionsModel.deleteMany({ expirationDate: { $lt: dayAgo } });
        this.logger.verbose('Old options cleaned');
    }
}
