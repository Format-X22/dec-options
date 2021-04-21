import { Test, TestingModule } from '@nestjs/testing';
import { AggregationApiController } from './aggregation-api.controller';
import { AggregationApiService } from './aggregation-api.service';

describe('AggregationApiController', () => {
  let aggregationApiController: AggregationApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AggregationApiController],
      providers: [AggregationApiService],
    }).compile();

    aggregationApiController = app.get<AggregationApiController>(AggregationApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(aggregationApiController.getHello()).toBe('Hello World!');
    });
  });
});
