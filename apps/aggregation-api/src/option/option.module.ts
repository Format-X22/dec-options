import { HttpModule, Module } from '@nestjs/common';
import { OptionService } from './option.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { OptionResolver } from './option.resolver';
import { MarketResolver } from './market.resolver';
import { SubscribersResolver } from './subscribers.resolver';
import { Subscribers, SubscribersSchema } from '@app/shared/subscribers.schema';
import { PriceModule } from '../price/price.module';
import { OrderBook, OrderBookSchema } from '@app/shared/orderbook.schema';
import { OrderBookResolver } from './orderbook.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Option.name, schema: OptionSchema },
            { name: Subscribers.name, schema: SubscribersSchema },
            { name: OrderBook.name, schema: OrderBookSchema },
        ]),
        HttpModule,
        PriceModule,
    ],
    providers: [OptionService, OptionResolver, MarketResolver, SubscribersResolver, OrderBookResolver],
})
export class OptionModule {}
