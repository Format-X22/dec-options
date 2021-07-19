import { Module } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OptionModule } from './options/option.module';
import { MetadataModule } from './metadata/metadata.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
        }),
        OptionModule,
        MetadataModule,
    ],
    providers: [OptionsAggregatorService],
})
export class OptionsAggregatorModule {}
