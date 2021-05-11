import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OptionsData, OptionsDataSchema } from '@app/shared/options-data.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: OptionsData.name, schema: OptionsDataSchema }])],
    controllers: [ApiController],
    providers: [ApiService],
})
export class ApiModule {}
