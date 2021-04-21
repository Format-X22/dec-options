import { NestFactory } from '@nestjs/core';
import { OptionsAggregatorModule } from './options-aggregator.module';
import { INestApplication } from '@nestjs/common';

const PORT: number = 3000;

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(OptionsAggregatorModule);
    await app.listen(PORT);
}
bootstrap();
