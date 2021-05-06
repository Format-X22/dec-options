import { Module } from '@nestjs/common';
import { AggregationApiController } from './aggregation-api.controller';
import { AggregationApiService } from './aggregation-api.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { OptionsData, OptionsDataSchema } from '@app/shared/options-data.schema';
import { ViewModule } from './view.module';

@Module({
    imports: [
        ViewModule,
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
        MongooseModule.forFeature([{ name: OptionsData.name, schema: OptionsDataSchema }]),
    ],
    controllers: [AggregationApiController],
    providers: [AggregationApiService],
})
export class AggregationApiModule {}
