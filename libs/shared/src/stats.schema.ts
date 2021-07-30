import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ versionKey: false })
export class StatsOpenInterestDetails {
    @Field()
    @Prop()
    expirationDate: Date;

    @Field()
    @Prop()
    strike: number;

    @Field()
    @Prop()
    openInterestChanges: number;
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

    @Field()
    @Prop()
    date: Date;

    @Field()
    @Prop()
    volume: number;

    @Field()
    @Prop()
    openInterestChanges: number;

    @Field((): Array<typeof StatsOpenInterestDetails> => [StatsOpenInterestDetails])
    @Prop({ type: [StatsOpenInterestDetailsSchema] })
    openInterestDetails: Array<StatsOpenInterestDetails>;
}

export type StatsDocument = Stats & mongoose.Document;
export const StatsSchema: mongoose.Schema<StatsDocument> = SchemaFactory.createForClass<Stats, StatsDocument>(Stats);