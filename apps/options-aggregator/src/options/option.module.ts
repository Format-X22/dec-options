import { HttpModule, Module } from '@nestjs/common';
import { HegicService } from './hegic.service';
import { DeribitService } from './deribit.service';
import { BinanceService } from './binance.service';
import { OkexService } from './okex.service';
import { AuctusService } from './auctus.service';
import { FinnexusService } from './finnexus.service';
import { OpynService } from './opyn.service';
import { SirenService } from './siren.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { OrderBook, OrderBookSchema } from '@app/shared/orderbook.schema';
import { BasePrice, BasePriceSchema } from '@app/shared/base-price.schema';

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
            { name: BasePrice.name, schema: BasePriceSchema },
        ]),
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
