import { Module } from '@nestjs/common';
import { CleanerService } from './cleaner.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { Stats, StatsSchema } from '@app/shared/stats.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Option.name, schema: OptionSchema },
            { name: Stats.name, schema: StatsSchema },
        ]),
    ],
    providers: [CleanerService],
})
export class CleanerModule {}
