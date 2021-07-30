import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { EMarketKey } from '@app/shared/market.schema';

export enum ESide {
    BUY = 'BUY',
    SELL = 'SELL',
}

@Schema({ versionKey: false })
export class TradeHistory {
    @Prop()
    marketKey: EMarketKey;

    @Prop()
    optionName: string;

    @Prop()
    expirationDate: Date;

    @Prop()
    strike: number;

    @Prop()
    base: string;

    @Prop()
    timestamp: number;

    @Prop()
    price: number;

    @Prop()
    baseQty: number;

    @Prop()
    quoteQty?: number;

    @Prop()
    side: ESide;
}

export type TradeHistoryDocument = TradeHistory & Document;
export const TradeHistorySchema: mongoose.Schema<TradeHistoryDocument> = SchemaFactory.createForClass<
    TradeHistory,
    TradeHistoryDocument
>(TradeHistory);
