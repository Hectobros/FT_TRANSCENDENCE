
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';


export class JoinChannelDto
{
	@IsInt()
	@Min(1)
	id: number

	@IsOptional()
	@IsString()
	@Length(1)
	password: string
}
