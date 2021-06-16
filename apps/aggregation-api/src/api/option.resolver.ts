import * as fieldsInfo from 'graphql-fields';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Base, ExpirationGroup, Option, OptionGQL, OptionList, StrikeGroup } from '@app/shared/option.schema';
import { ApiService } from './api.service';
import { ExpirationGroupArgs, OptionListArgs, StrikeGroupArgs } from './option.args';
import { Market, marketsMapByKey } from '@app/shared/market.schema';
import { GraphQLResolveInfo } from 'graphql/type/definition';

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

    @Query((): Array<typeof ExpirationGroup> => [ExpirationGroup])
    async expirations(@Args() args: ExpirationGroupArgs): Promise<Array<ExpirationGroup>> {
        return await this.apiService.getExpirations(args);
    }

    @Query((): Array<typeof StrikeGroup> => [StrikeGroup])
    async strikes(@Args() args: StrikeGroupArgs): Promise<Array<StrikeGroup>> {
        return await this.apiService.getStrikes(args);
    }

    @Query((): Array<typeof Base> => [Base])
    async bases(source: never, args: never, root: never, info: GraphQLResolveInfo): Promise<Array<Base>> {
        let pricesRequired: boolean = false;

        if ('usdPrice' in fieldsInfo(info)) {
            pricesRequired = true;
        }

        return await this.apiService.getBases(pricesRequired);
    }

    @ResolveField()
    market(@Parent() option: Option): Market {
        return marketsMapByKey.get(option.marketKey);
    }
}
