import { Test, TestingModule } from '@nestjs/testing';
import { FtxService } from './ftx.service';

describe('FtxService', (): void => {
    let service: FtxService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [FtxService],
            }).compile();

            service = module.get<FtxService>(FtxService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
