import { NestFactory } from '@nestjs/core';
import { OptionsAggregatorModule } from './options-aggregator.module';
import { INestApplicationContext } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';

async function bootstrap(): Promise<void> {
    const app: INestApplicationContext = await NestFactory.createApplicationContext(OptionsAggregatorModule);

    app.get(OptionsAggregatorService)
        .start()
        .catch((error: Error): void => {
            console.error('Fatal error on init', error);
            process.exit(1);
        });
}
bootstrap();
