import { NestFactory } from '@nestjs/core';
import { AggregationApiModule } from './aggregation-api.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';

const PORT: number = 3000;

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AggregationApiModule);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    const swaggerConfig: ReturnType<DocumentBuilder['build']> = new DocumentBuilder()
        .setTitle('3Commas Options')
        .setDescription('CEX/DEX options aggregator')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const documentation: OpenAPIObject = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api', app, documentation);

    await app.listen(PORT);
}
bootstrap();
