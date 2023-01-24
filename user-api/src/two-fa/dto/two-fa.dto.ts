import { IsString, IsBoolean, Length, IsJWT } from 'class-validator';

export class VerifyTwoFaCodeDto
{
	@IsJWT()
    token: string;

	@IsString()
	@Length(1)
	code: string
}

export class SendMailDto 
{
	@IsJWT()
    token: string;
}