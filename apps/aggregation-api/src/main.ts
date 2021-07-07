import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AppModule);
    const configService: ConfigService = app.get(ConfigService);
    const port: number = Number(configService.get<string>('OA_AGG_API_PORT'));

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    await app.listen(port);
}
bootstrap();
