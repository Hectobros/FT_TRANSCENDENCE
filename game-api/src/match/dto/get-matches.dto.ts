import { IsString, IsBoolean, Length, IsJWT } from 'class-validator';

export class GetMatchesDto 
{
	@IsJWT()
    token: string;
}