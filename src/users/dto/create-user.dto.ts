import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, isNumber, IsMobilePhone, MinLength, Matches, ValidateIf } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    name: string;

    @ValidateIf(o => o.email !== undefined && o.email !== '') 
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address ending with .com' })
    @Matches(/\.com$/, { message: 'Email must end with .com' })
    email?: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ValidateIf(o => o.mobileno !== undefined && o.mobileno !== '') 
    @IsOptional()
    @Matches(/^\d{10}$/, { message: 'Mobile number must be exactly 10 digits' })
    mobileno?: string;

    @ValidateIf(o => o.mobileno !== undefined && o.mobileno !== '') 
    @IsNotEmpty({ message: 'Country code is required if mobile number is provided' })
    @IsNumber({}, { message: 'Country code must be a number' })
    @IsOptional()
    country_code_id?: number;

    @IsNotEmpty({ message: 'Role is required' })
    @IsString({ message: 'Role must be a string' })
    role: string;

    @IsOptional()
    connectionid?: number;

}

export class LoginDto {
    @ValidateIf(o => o.email !== undefined && o.email !== '') 
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address ending with .com' })
    @Matches(/\.com$/, { message: 'Email must end with .com' })
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @ValidateIf(o => o.mobileno !== undefined && o.mobileno !== '') 
    @IsOptional()
    @Matches(/^\d{10}$/, { message: 'Mobile number must be exactly 10 digits' })
    mobileno?: string;

    @ValidateIf(o => o.mobileno !== undefined && o.mobileno !== '') 
    @IsNotEmpty({ message: 'Country code is required if mobile number is provided' })
    @IsNumber({}, { message: 'Country code must be a number' })
    @IsOptional()
    country_code_id?: number;
}

// DTO for deleting a user
export class DeleteUserDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;
}
