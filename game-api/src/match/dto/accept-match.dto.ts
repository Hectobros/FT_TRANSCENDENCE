import { IsString, IsBoolean, Length, IsJWT, IsOptional } from 'class-validator';

export class AcceptMatchDto 
{
	@IsJWT()
    token: string;

	@IsString()
	@Length(1)
	gameCode: string

	@IsOptional()
    @IsBoolean()
    accepted: boolean;

}