import { Test, TestingModule } from '@nestjs/testing';
import { MarketResolver } from './market.resolver';

describe('MarketResolver', (): void => {
    let resolver: MarketResolver;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [MarketResolver],
            }).compile();

            resolver = module.get<MarketResolver>(MarketResolver);
        },
    );

    it('should be defined', (): void => {
        expect(resolver).toBeDefined();
    });
});
