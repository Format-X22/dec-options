import { Module } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { HegicService } from './hegic/hegic.service';
import { OpynService } from './opyn/opyn.service';
import { PlotxService } from './_plotx/plotx.service';
import { CharmService } from './_charm/charm.service';
import { PrimitiveService } from './_primitive/primitive.service';
import { ProsperService } from './_prosper/prosper.service';
import { AuctusService } from './auctus/auctus.service';
import { FinnexusService } from './_finnexus/finnexus.service';
import { LienService } from './_lien/lien.service';
import { OpiumService } from './_opium/opium.service';
import { PodsService } from './_pods/pods.service';
import { XoptsService } from './_xopts/xopts.service';
import { SirenService } from './siren/siren.service';
import { DeribitService } from './deribit/deribit.service';
import { FtxService } from './ftx/ftx.service';
import { BinanceService } from './binance/binance.service';
import { OkexService } from './okex/okex.service';
import { OptionsData, OptionsDataSchema } from '@app/shared/options-data.schema';

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
        MongooseModule.forFeature([{ name: OptionsData.name, schema: OptionsDataSchema }]),
    ],
    providers: [
        OptionsAggregatorService,
        HegicService,
        OpynService,
        PlotxService,
        CharmService,
        PrimitiveService,
        ProsperService,
        AuctusService,
        FinnexusService,
        LienService,
        OpiumService,
        PodsService,
        XoptsService,
        SirenService,
        DeribitService,
        FtxService,
        BinanceService,
        OkexService,
    ],
})
export class OptionsAggregatorModule {}
