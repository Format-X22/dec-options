import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BasePrice, BasePriceSchema } from '@app/shared/price.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: BasePrice.name, schema: BasePriceSchema }])],
    exports: [PriceService],
    providers: [PriceService],
})
export class PriceModule {}
