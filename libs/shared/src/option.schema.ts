import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EMarketKey, EMarketType, Market } from '@app/shared/market.schema';

export enum EOptionType {
    PUT = 'PUT',
    CALL = 'CALL',
}
registerEnumType(EOptionType, { name: 'OptionType' });

@Schema({ versionKey: false })
@ObjectType()
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
    @Field((): typeof EMarketKey => EMarketKey)
    marketKey: EMarketKey;

    @Prop({ enum: EMarketType, type: String })
    @ApiProperty({ enum: EMarketType })
    @Field((): typeof EMarketType => EMarketType)
    marketType: EMarketType;

    @Prop({ enum: EOptionType, type: String })
    @ApiProperty({ enum: EOptionType })
    @Field((): typeof EOptionType => EOptionType)
    type: EOptionType;

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
}

@ObjectType()
export class Expiration {
    @Field()
    date: Date;

    @Field((): Array<typeof Market> => [Market])
    markets: Array<Market>;
}

export type OptionDocument = Option & Document;
export const OptionSchema: mongoose.Schema<OptionDocument> = SchemaFactory.createForClass<Option, OptionDocument>(
    Option,
);
