
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';


export class UserChannelDto
{
	@IsInt()
	@Min(1)
	id: number

}
