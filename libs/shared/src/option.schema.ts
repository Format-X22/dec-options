import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EMarketKey, EMarketType, Market } from '@app/shared/market.schema';
import { makePaginated } from '@app/shared/list.dto';

export enum EOptionType {
    PUT = 'PUT',
    CALL = 'CALL',
}
registerEnumType(EOptionType, { name: 'OptionType' });

export enum EOptionDeliveryType {
    DELIVERY = 'DELIVERY',
    SETTLEMENT = 'SETTLEMENT',
}
registerEnumType(EOptionDeliveryType, { name: 'OptionDeliveryType' });

export enum EOptionStyleType {
    AMERICAN = 'AMERICAN',
    EUROPEAN = 'EUROPEAN',
}
registerEnumType(EOptionStyleType, { name: 'OptionStyleType' });

@Schema({ versionKey: false })
@ObjectType({ isAbstract: true })
export class Option {
    @Field((): typeof String => String)
    _id?: mongoose.Schema.Types.ObjectId | string;

    @Prop()
    @Field()
    id: string;

    @Prop()
    @Field()
    name: string;

    @Prop({ enum: EMarketKey, type: String })
    marketKey: EMarketKey;

    @Prop({ enum: EMarketType, type: String })
    @Field((): typeof EMarketType => EMarketType)
    marketType: EMarketType;

    @Prop({ enum: EOptionType, type: String })
    @Field((): typeof EOptionType => EOptionType)
    type: EOptionType;

    @Prop({ enum: EOptionDeliveryType, type: String })
    @Field((): typeof EOptionDeliveryType => EOptionDeliveryType)
    deliveryType: EOptionDeliveryType;

    @Prop({ enum: EOptionStyleType, type: String })
    @Field((): typeof EOptionStyleType => EOptionStyleType)
    styleType: EOptionStyleType;

    @Prop()
    @Field()
    size: number;

    @Prop()
    @Field()
    strike: number;

    @Prop()
    @Field()
    strikeAsset: string;

    @Prop()
    @Field()
    expirationDate: Date;

    @Prop()
    @Field()
    base: string;

    @Prop()
    @Field()
    quote: string;

    @Prop()
    @Field()
    marketUrl: string;

    @Prop()
    @Field({ nullable: true })
    ask: number;

    @Prop()
    @Field({ nullable: true })
    bid: number;
}

@ObjectType('Option')
export class OptionGQL extends Option {
    @Field((): typeof Market => Market)
    market: Market;
}

@ObjectType()
export class OptionList extends makePaginated<Option>(OptionGQL) {}

@ObjectType()
export class ExpirationGroup {
    @Field((): typeof Date => Date)
    expirationDate: Option['expirationDate'];

    @Field((): Array<typeof Market> => [Market])
    markets: Array<Market>;

    @Field((): typeof Float => Float)
    strikes: number;
}

@ObjectType()
export class StrikeGroup {
    @Field((): typeof Float => Float)
    strike: Option['strike'];

    @Field((): Array<typeof Market> => [Market])
    markets: Array<Market>;

    @Field((): typeof EOptionType => EOptionType)
    type: Option['type'];

    @Field((): typeof String => String)
    base: Option['base'];

    @Field((): typeof Float => Float, { nullable: true })
    minAsk: number;

    @Field((): typeof Float => Float, { nullable: true })
    maxBid: number;
}

@ObjectType()
export class Base {
    @Field((): typeof String => String)
    symbol: Option['base'];

    @Field((): typeof Float => Float)
    usdPrice: number;
}

export type OptionDocument = Option & Document;
export const OptionSchema: mongoose.Schema<OptionDocument> = SchemaFactory.createForClass<Option, OptionDocument>(
    Option,
);
