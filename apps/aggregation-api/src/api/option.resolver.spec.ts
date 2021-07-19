import { Test, TestingModule } from '@nestjs/testing';
import { OptionResolver } from './option.resolver';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api.module';
import { HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { ApiService } from './api.service';

describe('OptionResolver', (): void => {
    let resolver: OptionResolver;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    cache: true,
                }),
                ApiModule,
                HttpModule,
                MongooseModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configService: ConfigService): MongooseModuleOptions => ({
                        uri: configService.get<string>('OA_MONGO_CONNECT'),
                    }),
                    inject: [ConfigService],
                }),
                MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
            ],
            providers: [ApiService, OptionResolver],
        }).compile();

        resolver = module.get<OptionResolver>(OptionResolver);
    });

    it('should be defined', (): void => {
        expect(resolver).toBeDefined();
    });
});
