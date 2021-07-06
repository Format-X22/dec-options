import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class BasePrice {
    @Prop()
    symbol: string;

    @Prop()
    price: number;
}

export type BasePriceDocument = BasePrice & mongoose.Document;
export const BasePriceSchema: mongoose.Schema<BasePriceDocument> = SchemaFactory.createForClass<
    BasePrice,
    BasePriceDocument
>(BasePrice);
