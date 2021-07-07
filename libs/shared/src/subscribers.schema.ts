import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubscribeResult {
    @Field((): typeof Boolean => Boolean)
    success: boolean;
}

@Schema({ versionKey: false })
@ObjectType({ isAbstract: true })
export class Subscribers {
    @Field((): typeof String => String)
    _id?: mongoose.Schema.Types.ObjectId | string;

    @Prop()
    @Field()
    date: Date;

    @Prop()
    @Field()
    email: string;
}

export type SubscribersDocument = Subscribers & Document;
export const SubscribersSchema: mongoose.Schema<SubscribersDocument> = SchemaFactory.createForClass<
    Subscribers,
    SubscribersDocument
>(Subscribers);
