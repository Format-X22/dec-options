import { HttpModule, Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BasePrice, BasePriceSchema, GweiPrice, GweiPriceSchema } from '@app/shared/price.schema';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: BasePrice.name, schema: BasePriceSchema },
            { name: GweiPrice.name, schema: GweiPriceSchema },
        ]),
    ],
    exports: [PriceService],
    providers: [PriceService],
})
export class PriceModule {}
