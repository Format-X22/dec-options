import fieldsInfo from 'graphql-fields';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Base, ExpirationGroup, Option, OptionGQL, OptionList, StrikeGroup } from '@app/shared/option.schema';
import { ApiService } from './api.service';
import { ExpirationGroupArgs, OptionListArgs, StrikeGroupArgs } from './option.args';
import { Market, marketsMapByKey } from '@app/shared/market.schema';
import { GraphQLResolveInfo } from 'graphql/type/definition';
import { PriceService } from '../price/price.service';

@Resolver((): typeof OptionGQL => OptionGQL)
export class OptionResolver {
    constructor(private readonly apiService: ApiService, private readonly priceService: PriceService) {}

    @Query((): typeof OptionGQL => OptionGQL)
    async option(@Args('_id') _id: string): Promise<Option | null> {
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
    async bases(_: never, __: never, ___: never, info: GraphQLResolveInfo): Promise<Array<Base>> {
        let pricesRequired: boolean = false;

        if ('usdPrice' in fieldsInfo(info)) {
            pricesRequired = true;
        }

        return await this.apiService.getBases(pricesRequired);
    }

    @ResolveField()
    market(@Parent() option: Option): Market | undefined {
        return marketsMapByKey.get(option.marketKey);
    }

    @ResolveField((): typeof Number => Number, { nullable: true })
    bidBase(@Parent() option: Option): number | null {
        if (Number.isFinite(option.bidBase)) {
            return option.bidBase;
        }

        if (!option.base || !Number.isFinite(option.bidQuote)) {
            return null;
        }

        const basePrice = this.priceService.getPrice(option.base);

        if (!basePrice) {
            return null;
        }

        return option.bidQuote / basePrice;
    }

    @ResolveField((): typeof Number => Number, { nullable: true })
    bidQuote(@Parent() option: Option): number | null {
        if (Number.isFinite(option.bidQuote)) {
            return option.bidQuote;
        }

        if (!option.base || !Number.isFinite(option.bidBase)) {
            return null;
        }

        const basePrice = this.priceService.getPrice(option.base);
        if (!basePrice) {
            return null;
        }

        return option.bidBase * basePrice;
    }

    @ResolveField((): typeof Number => Number, { nullable: true })
    askBase(@Parent() option: Option): number | null {
        if (Number.isFinite(option.askBase)) {
            return option.askBase;
        }

        if (!option.base || !Number.isFinite(option.askQuote)) {
            return null;
        }

        const basePrice = this.priceService.getPrice(option.base);

        if (!basePrice) {
            return null;
        }

        return option.askQuote / basePrice;
    }

    @ResolveField((): typeof Number => Number, { nullable: true })
    askQuote(@Parent() option: Option): number | null {
        if (Number.isFinite(option.askQuote)) {
            return option.askQuote;
        }

        if (!option.base || !Number.isFinite(option.askBase)) {
            return null;
        }

        const basePrice = this.priceService.getPrice(option.base);

        if (!basePrice) {
            return null;
        }

        return option.askBase * basePrice;
    }
}
