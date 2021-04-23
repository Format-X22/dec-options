import { NestFactory } from '@nestjs/core';
import { AggregationApiModule } from './aggregation-api.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AggregationApiModule);
    const configService: ConfigService = app.get(ConfigService);
    const port: number = Number(configService.get<string>('OA_AGG_API_PORT'));

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

    await app.listen(port);
}
bootstrap();
