import {IsNotEmpty, IsInt, IsString, IsOptional, Min, Length, IsBoolean } from 'class-validator';

export class CreateMessageDto
{
	@IsString()
	@IsNotEmpty()
	text: string;

	@IsInt()
  	@Min(1)
	@IsOptional()
	channelId: number;

	@IsInt()
  	@Min(1)
	@IsOptional()
	senderId: number;
}
