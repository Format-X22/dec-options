import { Test, TestingModule } from '@nestjs/testing';
import { ProsperService } from './prosper.service';

describe('ProsperService', (): void => {
    let service: ProsperService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [ProsperService],
            }).compile();

            service = module.get<ProsperService>(ProsperService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
