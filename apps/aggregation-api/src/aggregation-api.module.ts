import { Module } from '@nestjs/common';
import { AggregationApiController } from './aggregation-api.controller';
import { AggregationApiService } from './aggregation-api.service';

@Module({
    imports: [],
    controllers: [AggregationApiController],
    providers: [AggregationApiService],
})
export class AggregationApiModule {}
