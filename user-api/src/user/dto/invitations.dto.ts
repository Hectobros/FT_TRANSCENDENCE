import { IsBoolean, IsEnum, IsOptional, ValidateNested, Length, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiveInvitationsDto {
    @IsString()
    @Length(1)
    login: string;

    @IsString()
    @Length(1)
    gameCode: string;

}

export class ResponseInvitationsDto {
    @IsString()
    @Length(1)
    login: string;

    @IsString()
    @Length(1)
    gameCode: string;

    @IsOptional()
    @IsBoolean()
    accepted: boolean;

}

export class EmitInvitationsDto {
    @IsString()
    @Length(1)
    login: string;

    @IsString()
    @Length(1)
    gameCode: string;
}
