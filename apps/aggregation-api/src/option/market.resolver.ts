import { Query, Resolver } from '@nestjs/graphql';
import { Market } from '@app/shared/market.schema';
import { OptionService } from './option.service';

@Resolver((): typeof Market => Market)
export class MarketResolver {
    constructor(private readonly optionService: OptionService) {}

    @Query((): Array<typeof Market> => [Market])
    async markets(): Promise<Array<Market>> {
        return this.optionService.getMarkets();
    }
}
