import { Test, TestingModule } from '@nestjs/testing';
import { FeesService } from './fees.service';

describe('PriceService', (): void => {
    let service: FeesService;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FeesService],
        }).compile();

        service = module.get<FeesService>(FeesService);
    });

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
