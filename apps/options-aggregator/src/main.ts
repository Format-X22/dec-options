import { NestFactory } from '@nestjs/core';
import { OptionsAggregatorModule } from './options-aggregator.module';

async function bootstrap(): Promise<void> {
    await NestFactory.createApplicationContext(OptionsAggregatorModule);
}
bootstrap();
