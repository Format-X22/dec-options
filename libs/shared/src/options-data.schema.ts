import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum EMarketType {
    DEX = 'DEX',
    CEX = 'CEX',
}
registerEnumType(EMarketType, { name: 'MarketType' });

export enum EOptionType {
    PUT = 'PUT',
    CALL = 'CALL',
}
registerEnumType(EOptionType, { name: 'OptionType' });

export enum EMarket {
    DERIBIT = 'DERIBIT',
    BINANCE = 'BINANCE',
    OKEX = 'OKEX',
    AUCTUS = 'AUCTUS',
    HEGIC = 'HEGIC',
    OPYN = 'OPYN',
    SIREN = 'SIREN',
}
registerEnumType(EMarket, { name: 'Market' });

@Schema({ versionKey: false })
@ObjectType()
export class OptionsData {
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

    @Prop()
    @ApiProperty({ enum: EMarket })
    @Field((): typeof EMarket => EMarket)
    market: EMarket;

    @Prop()
    @ApiProperty({ enum: EMarketType })
    @Field((): typeof EMarketType => EMarketType)
    marketType: EMarketType;

    @Prop()
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

export type OptionsDataDocument = OptionsData & Document;
export const OptionsDataSchema: mongoose.Schema<OptionsDataDocument> = SchemaFactory.createForClass<
    OptionsData,
    OptionsDataDocument
>(OptionsData);
