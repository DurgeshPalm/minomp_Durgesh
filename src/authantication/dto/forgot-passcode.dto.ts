import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class ForgotPasscodeDto {
    @ValidateIf(o => !o.mobileno)
    @IsOptional()
    @IsEmail()
    email?: string;

    @ValidateIf(o => !o.email)
    @IsOptional()
    @IsString()
    mobileno?: string;

    @ValidateIf(o => o.mobileno)
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    country_code_id: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    new_password: string;
}