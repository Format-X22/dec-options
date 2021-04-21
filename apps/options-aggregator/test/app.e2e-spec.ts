import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OptionsAggregatorModule } from '../src/options-aggregator.module';
import * as superagent from 'superagent';

const SUCCESS_CODE: number = 200;

describe('OptionsAggregatorController (e2e)', (): void => {
    let app: INestApplication;

    beforeEach(
        async (): Promise<void> => {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [OptionsAggregatorModule],
            }).compile();

            app = moduleFixture.createNestApplication();
            await app.init();
        },
    );

    it('/ (GET)', (): superagent.SuperAgentRequest => {
        return request(app.getHttpServer()).get('/').expect(SUCCESS_CODE).expect('Hello World!');
    });
});
