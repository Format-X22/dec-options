import { Module } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule } from '@nestjs/config';
import { OptionModule } from './options/option.module';
import { PriceModule } from './price/price.module';
import { StatsModule } from './stats/stats.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanerModule } from './cleaner/cleaner.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
        }),
        ScheduleModule.forRoot(),
        OptionModule,
        PriceModule,
        StatsModule,
        CleanerModule,
    ],
    providers: [OptionsAggregatorService],
})
export class OptionsAggregatorModule {}
