import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { OptionResolver } from './option.resolver';
import { MarketResolver } from './market.resolver';

@Module({
    imports: [MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }])],
    controllers: [ApiController],
    providers: [ApiService, OptionResolver, MarketResolver],
})
export class ApiModule {}
