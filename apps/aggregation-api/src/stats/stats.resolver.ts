import { Query, Resolver } from '@nestjs/graphql';
import { Stats } from '@app/shared/stats.schema';
import { StatsService } from './stats.service';

@Resolver((): typeof Stats => Stats)
export class StatsResolver {
    constructor(private statsService: StatsService) {}

    @Query((): Array<typeof Stats> => [Stats])
    async stats(): Promise<Array<Stats>> {
        return this.statsService.getStats();
    }
}
