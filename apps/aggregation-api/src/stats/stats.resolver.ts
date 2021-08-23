import { Args, Query, Resolver } from '@nestjs/graphql';
import { Stats } from '@app/shared/stats.schema';
import { StatsService } from './stats.service';
import { StatsArgs } from './stats.args';

@Resolver((): typeof Stats => Stats)
export class StatsResolver {
    constructor(private statsService: StatsService) {}

    @Query((): Array<typeof Stats> => [Stats])
    async stats(@Args() args: StatsArgs): Promise<Array<Stats>> {
        return this.statsService.getStats(args);
    }
}
