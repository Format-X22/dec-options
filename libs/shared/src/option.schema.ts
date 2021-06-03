import { ApiProperty } from '@nestjs/swagger';
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
    @ApiProperty()
    @Field()
    id: string;

    @Prop()
    @ApiProperty()
    @Field()
    name: string;

    @Prop({ enum: EMarketKey, type: String })
    @ApiProperty({ enum: EMarketKey })
    marketKey: EMarketKey;

    @Prop({ enum: EMarketType, type: String })
    @ApiProperty({ enum: EMarketType })
    @Field((): typeof EMarketType => EMarketType)
    marketType: EMarketType;

    @Prop({ enum: EOptionType, type: String })
    @ApiProperty({ enum: EOptionType })
    @Field((): typeof EOptionType => EOptionType)
    type: EOptionType;

    @Prop({ enum: EOptionDeliveryType, type: String })
    @Field((): typeof EOptionDeliveryType => EOptionDeliveryType)
    deliveryType: EOptionDeliveryType;

    @Prop({ enum: EOptionStyleType, type: String })
    @Field((): typeof EOptionStyleType => EOptionStyleType)
    styleType: EOptionStyleType;

    @Prop()
    @ApiProperty()
    @Field()
    size: number;

    @Prop()
    @ApiProperty()
    @Field()
    strike: number;

    @Prop()
    @ApiProperty()
    @Field()
    strikeAsset: string;

    @Prop()
    @ApiProperty()
    @Field()
    expirationDate: Date;

    @Prop()
    @ApiProperty()
    @Field()
    base: string;

    @Prop()
    @ApiProperty()
    @Field()
    quote: string;

    @Prop()
    @ApiProperty()
    @Field()
    marketUrl: string;

    @Prop()
    @Field()
    ask: number;

    @Prop()
    @Field()
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

    @Field((): typeof Date => Date)
    expirationDate: Option['expirationDate'];
}

export type OptionDocument = Option & Document;
export const OptionSchema: mongoose.Schema<OptionDocument> = SchemaFactory.createForClass<Option, OptionDocument>(
    Option,
);
