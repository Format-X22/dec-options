import { Test, TestingModule } from '@nestjs/testing';
import { ApiResolver } from './api.resolver';

describe('ApiResolver', (): void => {
    let resolver: ApiResolver;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [ApiResolver],
            }).compile();

            resolver = module.get<ApiResolver>(ApiResolver);
        },
    );

    it('should be defined', (): void => {
        expect(resolver).toBeDefined();
    });
});
