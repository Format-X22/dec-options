import { ArgsType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ArgsType()
export class SubscribeGroupArgs {
    @Field((): typeof String => String)
    @IsString()
    email: string;
}
