import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional } from 'class-validator';

export class CreateUserChannelDto
{
	@IsInt()
	userId: number;

	@IsInt()
	channelId: number;

}