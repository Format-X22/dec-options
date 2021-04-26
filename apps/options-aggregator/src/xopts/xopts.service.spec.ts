import { Test, TestingModule } from '@nestjs/testing';
import { XoptsService } from './xopts.service';

describe('XoptsService', (): void => {
    let service: XoptsService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [XoptsService],
            }).compile();

            service = module.get<XoptsService>(XoptsService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
