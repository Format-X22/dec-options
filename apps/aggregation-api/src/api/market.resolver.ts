import { Args, Query, Resolver } from '@nestjs/graphql';
import { Market } from '@app/shared/market.schema';
import { ApiService } from './api.service';

@Resolver((): typeof Market => Market)
export class MarketResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): Array<typeof Market> => [Market])
    async markets(): Promise<Array<Market>> {
        return this.apiService.getMarkets();
    }
}
