import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
export class SendOtpDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    mobileno?: string;

    @ValidateIf(o => o.mobileno !== undefined && o.mobileno !== '') 
    @IsNotEmpty()
    @IsNumber()
    country_code_id: number;
}

export class VerifyOtpDto {
    @IsNotEmpty()
    @IsNumber()
    userid: number;

    @IsNotEmpty()
    @IsString()
    otp: string;
}


