import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
    @Query((): typeof String => String)
    getRoot(): string {
        return 'GraphQL OK';
    }
}
