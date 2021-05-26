import { Args, Query, Resolver } from '@nestjs/graphql';
import { EOptionType, Expiration, Option, OptionList } from '@app/shared/option.schema';
import { ApiService } from './api.service';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { OptionListArgs } from './option.args';

@Resolver((): typeof Option => Option)
export class OptionResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): typeof Option => Option)
    async option(@Args('_id') _id: string): Promise<Option> {
        return this.apiService.getOption(_id);
    }

    // TODO Draft
    @Query((): typeof OptionList => OptionList)
    async options(@Args() args: OptionListArgs): Promise<OptionList> {
        return {
            data: [
                {
                    id: '',
                    name: '',
                    marketKey: 'BINANCE' as EMarketKey,
                    marketType: 'CEX' as EMarketType,
                    size: 100,
                    base: '',
                    quote: '',
                    type: EOptionType.PUT,
                    strike: 1000,
                    strikeAsset: '',
                    expirationDate: new Date(),
                    marketUrl: '',
                },
            ],
            pagination: {
                total: 100,
                limit: 10,
                offset: 0,
            },
        };
    }

    @Query((): Array<typeof Expiration> => [Expiration])
    async expirations(): Promise<Array<Expiration>> {
        return await this.apiService.getExpirations();
    }
}
