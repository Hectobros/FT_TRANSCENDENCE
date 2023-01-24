
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';
import { UserChannelRole } from 'db-interface/Core';


export class GrantUserDto
{
	@IsInt()
	@Min(1)
	userId: number

	@IsInt()
	@Min(1)
	channelId: number

	@IsOptional()
	role: UserChannelRole = UserChannelRole.admin
}
