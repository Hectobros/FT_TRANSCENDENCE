import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { toNumber } from './helper';

export class QueryFilterDto {
    @Transform(({ value }) => toNumber(value, { default: undefined, min: 0 }))
    @IsOptional()
    onset?: number;

    @Transform(({ value }) => toNumber(value, { default: undefined, min: 0 }))
    @IsOptional()
    length?: number;

    @IsOptional()
    search?: string;
}
