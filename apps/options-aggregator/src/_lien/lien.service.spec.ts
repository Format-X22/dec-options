import { Test, TestingModule } from '@nestjs/testing';
import { LienService } from './lien.service';

describe('LienService', (): void => {
    let service: LienService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [LienService],
            }).compile();

            service = module.get<LienService>(LienService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
