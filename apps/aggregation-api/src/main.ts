import { NestFactory } from '@nestjs/core';
import { AggregationApiModule } from './aggregation-api.module';
import { INestApplication } from '@nestjs/common';

const PORT: number = 3000;

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AggregationApiModule);
    await app.listen(PORT);
}
bootstrap();
