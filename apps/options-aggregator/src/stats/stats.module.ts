import { HttpModule, Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { Stats, StatsSchema } from '@app/shared/stats.schema';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Option.name, schema: OptionSchema },
            { name: Stats.name, schema: StatsSchema },
        ]),
    ],
    providers: [StatsService],
    exports: [StatsService],
})
export class StatsModule {}
