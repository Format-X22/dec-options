import { Test, TestingModule } from '@nestjs/testing';
import { BinanceService } from './binance.service';

describe('BinanceService', (): void => {
    let service: BinanceService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [BinanceService],
            }).compile();

            service = module.get<BinanceService>(BinanceService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
