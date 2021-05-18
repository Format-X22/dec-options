import { Test, TestingModule } from '@nestjs/testing';
import { PlotxService } from './plotx.service';

describe('PlotxService', (): void => {
    let service: PlotxService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [PlotxService],
            }).compile();

            service = module.get<PlotxService>(PlotxService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
