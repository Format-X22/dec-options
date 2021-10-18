import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { EMarketKey } from '@app/shared/market.schema';
import { EOptionType } from '@app/shared/option.schema';

@ObjectType()
@Schema({ versionKey: false })
export class StatsDetails {
    @Field()
    @Prop()
    expirationDate: Date;

    @Field({ nullable: true })
    @Prop()
    strike: number;

    @Field()
    @Prop()
    type: EOptionType;

    @Field()
    @Prop()
    openInterest: number;

    @Field()
    @Prop()
    volume: number;

    @Field()
    @Prop()
    impliedVolatility: number;

    impliedVolatilityCount?: number;
}

export type StatsDetailsDocument = StatsDetails & mongoose.Document;
export const StatsDetailsSchema: mongoose.Schema<StatsDetailsDocument> = SchemaFactory.createForClass<
    StatsDetails,
    StatsDetailsDocument
>(StatsDetails);

@ObjectType()
@Schema({ versionKey: false })
export class Stats {
    @Field()
    @Prop({ index: true })
    base: string;

    @Field((): typeof EMarketKey => EMarketKey)
    @Prop({ enum: EMarketKey, type: String, index: true })
    marketKey: EMarketKey;

    @Field()
    @Prop()
    date: Date;

    @Field()
    @Prop()
    volume: number;

    @Field()
    @Prop()
    openInterest: number;

    @Field((): Array<typeof StatsDetails> => [StatsDetails])
    @Prop({ type: [StatsDetailsSchema] })
    details: Array<StatsDetails>;
}

export type StatsDocument = Stats & mongoose.Document;
export const StatsSchema: mongoose.Schema<StatsDocument> = SchemaFactory.createForClass<Stats, StatsDocument>(Stats);
