import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';

@ArgsType()
export class SubscribeGroupArgs {
    @Field((): typeof String => String)
    @IsString()
    @MinLength(4)
    @MaxLength(256)
    email?: string;
}
