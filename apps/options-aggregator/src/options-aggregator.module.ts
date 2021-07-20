import { Module } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule } from '@nestjs/config';
import { OptionModule } from './options/option.module';
import { PriceModule } from './price/price.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
        }),
        OptionModule,
        PriceModule,
    ],
    providers: [OptionsAggregatorService],
})
export class OptionsAggregatorModule {}
