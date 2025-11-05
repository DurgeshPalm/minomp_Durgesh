import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PhotoPaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 6; // default 6 photos
}
