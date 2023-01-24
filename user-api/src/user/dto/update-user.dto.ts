import { IsBoolean, IsEnum, IsOptional, ValidateNested, Length, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MapID, PaddleID } from 'db-interface/Core';

export class UpdateSettingsDto {
    @IsBoolean()
    twoFa: boolean;

    @IsEnum(PaddleID)
    paddle_id: PaddleID;

    @IsEnum(MapID)
    map_id: MapID;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(1)
    username?: string;

    @IsOptional()
    @IsBoolean()
    twoFa: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateSettingsDto)
    settings?: UpdateSettingsDto;
}
