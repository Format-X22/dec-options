import { Test, TestingModule } from '@nestjs/testing';
import { FinnexusService } from './finnexus.service';

describe('FinnexusService', (): void => {
    let service: FinnexusService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [FinnexusService],
            }).compile();

            service = module.get<FinnexusService>(FinnexusService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
