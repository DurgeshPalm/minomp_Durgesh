import { IsBoolean, IsOptional } from 'class-validator';

export class EnableDto {
  @IsBoolean()
  enabled: boolean;
}
