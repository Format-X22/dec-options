import { Injectable } from '@nestjs/common';

@Injectable()
export class AggregationApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
