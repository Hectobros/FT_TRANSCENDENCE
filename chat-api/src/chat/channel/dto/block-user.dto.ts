
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';


export class BlockUserDto
{
	@IsString()
	@Length(1)
	login: string

	@IsInt()
	@Min(1)
	channelId: number

}
