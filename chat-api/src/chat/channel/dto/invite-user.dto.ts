
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';
import { UserChannelRole } from 'db-interface/Core';


export class InviteUserDto
{
	@IsString()
	@Length(1)
	userLogin: string

	@IsInt()
	@Min(1)
	channelId: number

}
