import { Test, TestingModule } from '@nestjs/testing';
import { MarketResolver } from './market.resolver';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OptionModule } from './option.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { OptionService } from './option.service';
import { HttpModule } from '@nestjs/common';

describe('MarketResolver', (): void => {
    let resolver: MarketResolver;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    cache: true,
                }),
                OptionModule,
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
            providers: [OptionService, MarketResolver],
        }).compile();

        resolver = module.get<MarketResolver>(MarketResolver);
    });

    it('should be defined', (): void => {
        expect(resolver).toBeDefined();
    });
});
