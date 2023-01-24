
import {IsNotEmpty, IsInt, IsString, Min, Length, IsBoolean, IsOptional, IsEnum, NotContains } from 'class-validator';
import { UserChannelRole } from 'db-interface/Core';


export class MuteUserDto
{
	@IsString()
	@Length(1)
	userLogin: string

	@IsInt()
	@Min(1)
	channelId: number

	@IsBoolean()
	muted: boolean

}
