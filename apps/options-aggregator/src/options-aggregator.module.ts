import { Module } from '@nestjs/common';
import { OptionsAggregatorController } from './options-aggregator.controller';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService): MongooseModuleOptions => ({
                uri: configService.get<string>('OA_MONGO_CONNECT'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [OptionsAggregatorController],
    providers: [OptionsAggregatorService],
})
export class OptionsAggregatorModule {}
