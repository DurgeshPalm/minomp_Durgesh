import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UsePipes, ValidationPipe ,UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindParentChildDto } from './dto/findParentChild.dto';
import { AuthGuardGuard } from '../Global/auth-guard/auth-guard.guard'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/createUser')
  // @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors.map(
            (error) => error.constraints 
                ? Object.values(error.constraints).join(', ')
                : 'Unknown validation error'
        );
    
        return {
          resp_code: 400,
          resp_message: 'Validation Failed',
          errors: errorMessages
        };
      },
    }),
  )
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(AuthGuardGuard) // ✅ Apply Guard
  @Post('/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('mobileno') mobileno: string,
    @Body('country_code_id') country_code_id: number,
  ) {
    return this.usersService.login(email,password,mobileno,country_code_id);
}

  @Get('/getCountryCode')
  async getCountryCode() {
    return this.usersService.getCountryCode();
  }

  @Put('/deleteUser/:id')
  async deleteUser(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  @Post('find_parent_child')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors.map(
          (error) => error.constraints 
            ? Object.values(error.constraints).join(', ')
            : 'Unknown validation error'
        );

        return {
          resp_code: 400,
          resp_message: 'Validation Failed',
          errors: errorMessages,
        };
      },
    }),
  )
  async findParentChild(@Body() findDto: FindParentChildDto) {
    return await this.usersService.findParentChild(findDto);
  }
}
