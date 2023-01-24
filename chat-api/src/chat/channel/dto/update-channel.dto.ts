import { Type } from 'class-transformer';
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean, toUpperCase, toLowerCase, toNumber, trim, toDate } from 'src/common/helper/cast.helper';

import { ChannelType } from 'db-interface/Core';

export class UpdateChannelDto
{

	@IsInt()
	@Min(1)
	id: number;

	@IsOptional()
	@IsString()
	@Length(1)
	password: string;

	@IsOptional()
	@IsEnum(ChannelType)
	type: ChannelType;

}