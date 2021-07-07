import { HttpModule, Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BasePrice, BasePriceSchema } from '@app/shared/base-price.schema';

@Module({
    imports: [HttpModule, MongooseModule.forFeature([{ name: BasePrice.name, schema: BasePriceSchema }])],
    exports: [PriceService],
    providers: [PriceService],
})
export class PriceModule {}
