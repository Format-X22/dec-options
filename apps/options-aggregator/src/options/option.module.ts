import { HttpModule, Module } from '@nestjs/common';
import { HegicService } from './hegic/hegic.service';
import { DeribitService } from './deribit/deribit.service';
import { BinanceService } from './binance/binance.service';
import { OkexService } from './okex/okex.service';
import { AuctusService } from './auctus/auctus.service';
import { FinnexusService } from './finnexus/finnexus.service';
import { OpynService } from './opyn/opyn.service';
import { SirenService } from './siren/siren.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { OrderBook, OrderBookSchema } from '@app/shared/orderbook.schema';
import { PriceModule } from '../price/price.module';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService): MongooseModuleOptions => ({
                uri: configService.get<string>('OA_MONGO_CONNECT'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: Option.name, schema: OptionSchema },
            { name: OrderBook.name, schema: OrderBookSchema },
        ]),
        PriceModule,
        HttpModule,
    ],
    providers: [
        HegicService,
        DeribitService,
        BinanceService,
        OkexService,
        AuctusService,
        FinnexusService,
        OpynService,
        SirenService,
    ],
    exports: [
        HegicService,
        DeribitService,
        BinanceService,
        OkexService,
        AuctusService,
        FinnexusService,
        OpynService,
        SirenService,
    ],
})
export class OptionModule {}
