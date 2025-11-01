import { IsBoolean, IsEmail, IsOptional, IsString, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CronMailDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsString()
  subject: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean; // if provided, we can start/stop job accordingly
}
