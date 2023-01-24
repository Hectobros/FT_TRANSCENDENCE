
import {IsNotEmpty, IsInt, IsJWT, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';

export class DirectMessageDto
{
	@IsString()
	@Length(1)
	login: string
}


export class DirectMessageDtoControllerVersion
{
	@IsJWT()
	token: string

	@IsString()
	@Length(1)
	login: string
}