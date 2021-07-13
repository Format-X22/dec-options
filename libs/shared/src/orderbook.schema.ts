import { Field, Float, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EMarketKey } from '@app/shared/market.schema';

@Schema({ versionKey: false })
@ObjectType()
export class OrderBookOrder {
    @Prop()
    @Field((): typeof Float => Float)
    price: number;

    @Prop()
    @Field((): typeof Float => Float)
    amount: number;

    marketName?: string;
}

export type OrderBookOrderDocument = OrderBookOrder & mongoose.Document;
export const OrderBookOrderSchema: mongoose.Schema<OrderBookOrderDocument> = SchemaFactory.createForClass<
    OrderBookOrder,
    OrderBookOrderDocument
>(OrderBookOrder);

@Schema({ versionKey: false })
@ObjectType()
export class OrderBook {
    @Field((): typeof String => String)
    _id?: mongoose.Schema.Types.ObjectId | string;

    @Prop({ enum: EMarketKey, type: String })
    @Field((): typeof EMarketKey => EMarketKey)
    optionMarketKey: EMarketKey;

    @Prop()
    @Field((): typeof String => String)
    optionId: string;

    @Prop({ type: [OrderBookOrderSchema] })
    @Field((): Array<typeof OrderBookOrder> => [OrderBookOrder])
    asks: Array<OrderBookOrder>;

    @Prop({ type: [OrderBookOrderSchema] })
    @Field((): Array<typeof OrderBookOrder> => [OrderBookOrder])
    bids: Array<OrderBookOrder>;
}

export type OrderBookDocument = OrderBook & mongoose.Document;
export const OrderBookSchema: mongoose.Schema<OrderBookDocument> = SchemaFactory.createForClass<
    OrderBook,
    OrderBookDocument
>(OrderBook);
