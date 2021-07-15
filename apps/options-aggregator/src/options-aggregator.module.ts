import { HttpModule, Module } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { HegicService } from './hegic/hegic.service';
import { DeribitService } from './deribit/deribit.service';
import { BinanceService } from './binance/binance.service';
import { OkexService } from './okex/okex.service';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { OrderBook, OrderBookSchema } from '@app/shared/orderbook.schema';
import { BasePrice, BasePriceSchema } from '@app/shared/base-price.schema';

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
        MongooseModule.forFeature([
            { name: Option.name, schema: OptionSchema },
            { name: OrderBook.name, schema: OrderBookSchema },
            { name: BasePrice.name, schema: BasePriceSchema },
        ]),
        HttpModule,
    ],
    providers: [OptionsAggregatorService, HegicService, DeribitService, BinanceService, OkexService],
})
export class OptionsAggregatorModule {}
