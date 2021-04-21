import { Module } from '@nestjs/common';
import { OptionsAggregatorController } from './options-aggregator.controller';
import { OptionsAggregatorService } from './options-aggregator.service';

@Module({
    imports: [],
    controllers: [OptionsAggregatorController],
    providers: [OptionsAggregatorService],
})
export class OptionsAggregatorModule {}
