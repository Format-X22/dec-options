import { Test, TestingModule } from '@nestjs/testing';
import { OptionResolver } from './option.resolver';

describe('OptionResolver', (): void => {
    let resolver: OptionResolver;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [OptionResolver],
            }).compile();

            resolver = module.get<OptionResolver>(OptionResolver);
        },
    );

    it('should be defined', (): void => {
        expect(resolver).toBeDefined();
    });
});
