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

@Schema()
export class OptionsData {
    @Prop()
    @ApiProperty()
    id: string;

    @Prop()
    @ApiProperty()
    market: string;

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
    expirationDate: Date;

    @Prop()
    @ApiProperty()
    base: string;

    @Prop()
    @ApiProperty()
    quote: string;
}

export type OptionsDataDocument = OptionsData & Document;
export const OptionsDataSchema: mongoose.Schema<OptionsDataDocument> = SchemaFactory.createForClass<
    OptionsData,
    OptionsDataDocument
>(OptionsData);
