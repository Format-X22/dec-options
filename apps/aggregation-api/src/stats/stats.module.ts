import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsResolver } from './stats.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Stats, StatsSchema } from '@app/shared/stats.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Stats.name, schema: StatsSchema }])],
    providers: [StatsService, StatsResolver],
})
export class StatsModule {}
