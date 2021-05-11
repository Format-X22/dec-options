import { Test, TestingModule } from '@nestjs/testing';
import { ViewController } from './view.controller';

describe('ViewController', (): void => {
    let controller: ViewController;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                controllers: [ViewController],
            }).compile();

            controller = module.get<ViewController>(ViewController);
        },
    );

    it('should be defined', (): void => {
        expect(controller).toBeDefined();
    });
});
