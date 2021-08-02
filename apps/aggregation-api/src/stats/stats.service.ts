import { Injectable } from '@nestjs/common';
import { Stats, StatsDocument } from '@app/shared/stats.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StatsService {
    constructor(@InjectModel(Stats.name) private statsModel: Model<StatsDocument>) {}

    async getStats(): Promise<Array<Stats>> {
        return this.statsModel.find({});
    }
}
