import { Args, Query, Resolver } from '@nestjs/graphql';
import { SubscribeResult } from '@app/shared/subscribers.schema';
import { OptionService } from './option.service';
import { SubscribeGroupArgs } from './subscribers.args';

@Resolver((): typeof SubscribeResult => SubscribeResult)
export class SubscribersResolver {
    constructor(private readonly optionService: OptionService) {}

    @Query((): typeof SubscribeResult => SubscribeResult)
    async subscribe(@Args() args: SubscribeGroupArgs): Promise<SubscribeResult> {
        return this.optionService.subscribe(args);
    }
}
