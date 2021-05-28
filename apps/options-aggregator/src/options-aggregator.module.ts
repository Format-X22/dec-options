import { Module } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { HegicService } from './hegic/hegic.service';
import { OpynService } from './opyn/opyn.service';
import { AuctusService } from './auctus/auctus.service';
import { SirenService } from './siren/siren.service';
import { DeribitService } from './deribit/deribit.service';
import { BinanceService } from './binance/binance.service';
import { OkexService } from './okex/okex.service';
import { Option, OptionSchema } from '@app/shared/option.schema';

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
        MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
    ],
    providers: [
        OptionsAggregatorService,
        HegicService,
        OpynService,
        AuctusService,
        SirenService,
        DeribitService,
        BinanceService,
        OkexService,
    ],
})
export class OptionsAggregatorModule {}
