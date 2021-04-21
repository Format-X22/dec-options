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

            aggregationApiController = app.get<AggregationApiController>(AggregationApiController);
        },
    );

    describe('root', (): void => {
        it('should return "Hello World!"', (): void => {
            expect(aggregationApiController.getHello()).toBe('Hello World!');
        });
    });
});
