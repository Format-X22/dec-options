import { Injectable } from '@nestjs/common';
import { Stats, StatsDocument } from '@app/shared/stats.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StatsService {
    constructor(@InjectModel(Stats.name) private statsModel: Model<StatsDocument>) {}

    async getStats(): Promise<Array<Stats>> {
        return this.statsModel
            .aggregate([
                {
                    $project: {
                        base: 1,
                        marketKey: 1,
                        volume: 1,
                        openInterest: 1,
                        date: 1,
                        details: {
                            expirationDate: 1,
                            strike: 1,
                            type: 1,
                            openInterest: 1,
                            volume: 1,
                            impliedVolatility: 1,
                        },
                    },
                },
                {
                    $group: {
                        _id: { createdAt: '$month', base: '$base', marketKey: '$marketKey' },
                        base: { $first: '$base' },
                        marketKey: { $first: '$marketKey' },
                        date: { $first: '$date' },
                        volume: { $sum: '$volume' },
                        openInterest: { $max: '$openInterest' },
                        details: { $first: '$details' },
                        numberOfStats: { $sum: 1 },
                    },
                },
            ])
            .exec();
    }
}
