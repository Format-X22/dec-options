import { Args, Query, Resolver } from '@nestjs/graphql';
import { Expiration, Option } from '@app/shared/option.schema';
import { ApiService } from './api.service';

@Resolver((): typeof Option => Option)
export class OptionResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): typeof Option => Option)
    async option(@Args('_id') _id: string): Promise<Option> {
        return this.apiService.getOption(_id);
    }

    @Query((): Array<typeof Expiration> => [Expiration])
    async expirations(): Promise<Array<Expiration>> {
        return await this.apiService.getExpirations();
    }
}
