import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Fees, FeesSchema } from '@app/shared/fees.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Fees.name, schema: FeesSchema }])],
    exports: [FeesService],
    providers: [FeesService],
})
export class FeesModule {}
