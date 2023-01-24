import { IsString, IsBoolean, Length, IsJWT, IsOptional } from 'class-validator';

export class CreateMatchDto 
{
	@IsJWT()
    token: string;

	@IsString()
	@Length(1)
	login: string

	@IsOptional()
    @IsBoolean()
    custom: boolean;

}