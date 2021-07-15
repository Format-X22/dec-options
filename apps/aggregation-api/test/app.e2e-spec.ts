import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as superagent from 'superagent';

const SUCCESS_CODE = 200;

describe('AggregationApiController (e2e)', (): void => {
    let app: INestApplication;

    beforeEach(async (): Promise<void> => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/ (GET) - success code', (): superagent.SuperAgentRequest => {
        return request(app.getHttpServer()).get('/').expect(SUCCESS_CODE);
    });

    it('/api (GET) - success code', (): superagent.SuperAgentRequest => {
        return request(app.getHttpServer()).get('/api').expect(SUCCESS_CODE);
    });

    it('/api/options-params (GET) - success code', (): superagent.SuperAgentRequest => {
        return request(app.getHttpServer()).get('/api/options-params').expect(SUCCESS_CODE);
    });

    afterEach(async (): Promise<void> => {
        await app.close();
    });
});
