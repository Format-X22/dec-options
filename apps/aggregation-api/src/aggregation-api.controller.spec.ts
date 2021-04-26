import { Test, TestingModule } from '@nestjs/testing';
import { AggregationApiController } from './aggregation-api.controller';
import { AggregationApiService } from './aggregation-api.service';

describe('AggregationApiController', (): void => {
    let aggregationApiController: AggregationApiController;

    beforeEach(
        async (): Promise<void> => {
            const app: TestingModule = await Test.createTestingModule({
                controllers: [AggregationApiController],
                providers: [AggregationApiService],
            }).compile();

            app.get<AggregationApiController>(AggregationApiController);
        },
    );
});
