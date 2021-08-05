import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { EMarketKey } from '@app/shared/market.schema';

@ObjectType()
@Schema({ versionKey: false })
export class StatsOpenInterestDetails {
    @Field()
    @Prop()
    expirationDate: Date;

    @Field({ nullable: true })
    @Prop()
    strike: number;

    @Field()
    @Prop()
    openInterest: number;

    @Field()
    @Prop()
    volume: number;
}

export type StatsOpenInterestDetailsDocument = StatsOpenInterestDetails & mongoose.Document;
export const StatsOpenInterestDetailsSchema: mongoose.Schema<StatsOpenInterestDetailsDocument> =
    SchemaFactory.createForClass<StatsOpenInterestDetails, StatsOpenInterestDetailsDocument>(StatsOpenInterestDetails);

@ObjectType()
@Schema({ versionKey: false })
export class Stats {
    @Field()
    @Prop()
    base: string;

    @Field((): typeof EMarketKey => EMarketKey)
    @Prop({ enum: EMarketKey, type: String })
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

    @Field((): Array<typeof StatsOpenInterestDetails> => [StatsOpenInterestDetails])
    @Prop({ type: [StatsOpenInterestDetailsSchema] })
    openInterestDetails: Array<StatsOpenInterestDetails>;
}

export type StatsDocument = Stats & mongoose.Document;
export const StatsSchema: mongoose.Schema<StatsDocument> = SchemaFactory.createForClass<Stats, StatsDocument>(Stats);
