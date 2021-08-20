import { Test, TestingModule } from '@nestjs/testing';
import { CleanerService } from './cleaner.service';

describe('CleanerService', () => {
    let service: CleanerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CleanerService],
        }).compile();

        service = module.get<CleanerService>(CleanerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
