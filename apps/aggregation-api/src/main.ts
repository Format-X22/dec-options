import { NestFactory } from '@nestjs/core';
import { AggregationApiModule } from './aggregation-api.module';

async function bootstrap() {
  const app = await NestFactory.create(AggregationApiModule);
  await app.listen(3000);
}
bootstrap();
