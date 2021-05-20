import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export enum EMarketType {
    DEX = 'DEX',
    CEX = 'CEX',
}

export enum EOptionType {
    PUT = 'PUT',
    CALL = 'CALL',
}

export enum EMarket {
    DERIBIT = 'DERIBIT',
    BINANCE = 'BINANCE',
    OKEX = 'OKEX',
    AUCTUS = 'AUCTUS',
    HEGIC = 'HEGIC',
    OPYN = 'OPYN',
    SIREN = 'SIREN',
}

@Schema({ versionKey: false })
export class OptionsData {
    _id?: string;

    @Prop()
    @ApiProperty()
    id: string;

    @Prop()
    @ApiProperty()
    name: string;

    @Prop()
    @ApiProperty({ enum: EMarket })
    market: EMarket;

    @Prop()
    @ApiProperty({ enum: EMarketType })
    marketType: EMarketType;

    @Prop()
    @ApiProperty({ enum: EOptionType })
    type: EOptionType;

    @Prop()
    @ApiProperty()
    size: number;

    @Prop()
    @ApiProperty()
    strike: number;

    @Prop()
    @ApiProperty()
    strikeAsset: string;

    @Prop()
    @ApiProperty()
    expirationDate: Date;

    @Prop()
    @ApiProperty()
    base: string;

    @Prop()
    @ApiProperty()
    quote: string;

    @Prop()
    @ApiProperty()
    marketUrl: string;
}

export type OptionsDataDocument = OptionsData & Document;
export const OptionsDataSchema: mongoose.Schema<OptionsDataDocument> = SchemaFactory.createForClass<
    OptionsData,
    OptionsDataDocument
>(OptionsData);
