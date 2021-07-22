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

@Schema({ versionKey: false })
export class GweiPrice {
    @Prop()
    slow: number;

    @Prop()
    standard: number;

    @Prop()
    fast: number;
}

export type GweiPriceDocument = GweiPrice & mongoose.Document;
export const GweiPriceSchema: mongoose.Schema<GweiPriceDocument> = SchemaFactory.createForClass<
    GweiPrice,
    GweiPriceDocument
>(GweiPrice);
