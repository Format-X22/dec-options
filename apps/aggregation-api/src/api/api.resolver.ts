import { Args, Query, Resolver } from '@nestjs/graphql';
import { OptionsData } from '@app/shared/options-data.schema';
import { ApiService } from './api.service';

@Resolver((): typeof OptionsData => OptionsData)
export class ApiResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): typeof OptionsData => OptionsData)
    async option(@Args('_id') _id: string): Promise<OptionsData> {
        return this.apiService.getOption(_id);
    }
}
