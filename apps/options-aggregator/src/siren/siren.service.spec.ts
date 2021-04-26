import { Test, TestingModule } from '@nestjs/testing';
import { SirenService } from './siren.service';

describe('SirenService', (): void => {
    let service: SirenService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [SirenService],
            }).compile();

            service = module.get<SirenService>(SirenService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
