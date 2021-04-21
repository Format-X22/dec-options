import { Controller, Get } from '@nestjs/common';
import { AggregationApiService } from './aggregation-api.service';

@Controller()
export class AggregationApiController {
  constructor(private readonly aggregationApiService: AggregationApiService) {}

  @Get()
  getHello(): string {
    return this.aggregationApiService.getHello();
  }
}
