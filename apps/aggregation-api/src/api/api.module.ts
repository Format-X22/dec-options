import { HttpModule, Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { OptionResolver } from './option.resolver';
import { MarketResolver } from './market.resolver';
import { SubscribersResolver } from './subscribers.resolver';
import { Subscribers, SubscribersSchema } from '@app/shared/subscribers.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Option.name, schema: OptionSchema },
            { name: Subscribers.name, schema: SubscribersSchema },
        ]),
        HttpModule,
    ],
    providers: [ApiService, OptionResolver, MarketResolver, SubscribersResolver],
})
export class ApiModule {}
