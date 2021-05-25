import { Args, Query, Resolver } from '@nestjs/graphql';
import { Option } from '@app/shared/option.schema';
import { ApiService } from './api.service';

@Resolver((): typeof Option => Option)
export class OptionResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): typeof Option => Option)
    async option(@Args('_id') _id: string): Promise<Option> {
        return this.apiService.getOption(_id);
    }
}
