import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsResolver } from './stats.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Stats, StatsSchema } from '@app/shared/stats.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [MongooseModule.forFeature([{ name: Stats.name, schema: StatsSchema }]), ConfigModule],
    providers: [StatsService, StatsResolver],
})
export class StatsModule {}
