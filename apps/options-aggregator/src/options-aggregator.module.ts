import { Module } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule } from '@nestjs/config';
import { OptionModule } from './options/option.module';
import { PriceModule } from './price/price.module';
import { FeesModule } from './fees/fees.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
        }),
        OptionModule,
        PriceModule,
        FeesModule,
    ],
    providers: [OptionsAggregatorService],
})
export class OptionsAggregatorModule {}
