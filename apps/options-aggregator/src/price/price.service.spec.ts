import { Test, TestingModule } from '@nestjs/testing';
import { PriceService } from './price.service';

describe('PriceService', (): void => {
    let service: PriceService;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PriceService],
        }).compile();

        service = module.get<PriceService>(PriceService);
    });

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
