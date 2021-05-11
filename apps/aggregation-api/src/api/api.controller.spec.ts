import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';

describe('ApiController', (): void => {
    let controller: ApiController;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                controllers: [ApiController],
            }).compile();

            controller = module.get<ApiController>(ApiController);
        },
    );

    it('should be defined', (): void => {
        expect(controller).toBeDefined();
    });
});
