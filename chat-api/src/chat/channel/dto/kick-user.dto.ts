
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';

export class KickUserDto
{
	@IsInt()
	@Min(1)
	userId: number

	@IsInt()
	@Min(1)
	channelId: number

	@IsOptional()
	@IsInt()
	expirationDate: number
}
