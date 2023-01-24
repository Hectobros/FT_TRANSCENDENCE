import { IsBoolean, IsEnum, IsOptional, ValidateNested, Length, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PreventUserDto {
    @IsString()
    @Length(1)
    login: string;

    @IsOptional()
    @IsString()
    @Length(1)
    msg: string;

}
