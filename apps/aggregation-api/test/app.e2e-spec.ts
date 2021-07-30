import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as superagent from 'superagent';

const SUCCESS_CODE: number = 200;

describe('AggregationApiController (e2e)', (): void => {
    let app: INestApplication;

    beforeEach(async (): Promise<void> => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async (): Promise<void> => {
        await app.close();
    });
});
