import { Args, Query, Resolver } from '@nestjs/graphql';
import { SubscribeResult } from '@app/shared/subscribers.schema';
import { ApiService } from './api.service';
import { SubscribeGroupArgs } from './subscribers.args';

@Resolver((): typeof SubscribeResult => SubscribeResult)
export class SubscribersResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): typeof SubscribeResult => SubscribeResult)
    async subscribe(@Args() args: SubscribeGroupArgs): Promise<SubscribeResult> {
        return this.apiService.subscribe(args);
    }
}
