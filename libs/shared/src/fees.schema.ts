import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { EMarketKey } from '@app/shared/market.schema';
import { Field, ObjectType } from '@nestjs/graphql';

@Schema({ versionKey: false })
@ObjectType()
export class Fees {
    @Prop({ enum: EMarketKey, type: String })
    @Field((): typeof EMarketKey => EMarketKey)
    marketKey: EMarketKey;

    @Prop()
    @Field()
    percent: number;

    @Prop()
    @Field()
    transactionUsd: number;

    @Prop()
    @Field()
    fixedUsd: number;
}

export type FeesDocument = Fees & mongoose.Document;
export const FeesSchema: mongoose.Schema<FeesDocument> = SchemaFactory.createForClass<Fees, FeesDocument>(Fees);
