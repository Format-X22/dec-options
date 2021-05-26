import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Expiration, Option, OptionGQL, OptionList } from '@app/shared/option.schema';
import { ApiService } from './api.service';
import { OptionListArgs } from './option.args';
import { Market, marketsMapByKey } from '@app/shared/market.schema';

@Resolver((): typeof OptionGQL => OptionGQL)
export class OptionResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): typeof OptionGQL => OptionGQL)
    async option(@Args('_id') _id: string): Promise<Option> {
        return this.apiService.getOption(_id);
    }

    @Query((): typeof OptionList => OptionList)
    async options(@Args() args: OptionListArgs): Promise<OptionList> {
        return this.apiService.getOptions(args);
    }

    @Query((): Array<typeof Expiration> => [Expiration])
    async expirations(): Promise<Array<Expiration>> {
        return await this.apiService.getExpirations();
    }

    @ResolveField()
    market(@Parent() option: Option): Market {
        return marketsMapByKey.get(option.marketKey);
    }
}
