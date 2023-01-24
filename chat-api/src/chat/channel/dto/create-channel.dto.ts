import { Type } from 'class-transformer';
import {IsNotEmpty, IsInt, IsString, Min, Length, IsOptional, IsEnum, NotContains } from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean, toUpperCase, toLowerCase, toNumber, trim, replaceSpace, toDate } from 'src/common/helper/cast.helper';

import { ChannelType } from 'db-interface/Core';

export class CreateChannelDto
{
	@IsString()
	@Length(1)
	@Transform(({ value }) => trim(value))
	@Transform(({ value }) => replaceSpace(value))
	// @NotContains(" ", { message: "No spaces allowed" } )
	name: string;

	@IsEnum(ChannelType)
	type: ChannelType;

	@IsOptional()
	@IsString()
	@Length(1)
	password: string;

}
