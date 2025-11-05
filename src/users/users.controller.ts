import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UsePipes, ValidationPipe ,UseGuards, UploadedFile,UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindParentChildDto } from './dto/findParentChild.dto';
import { AuthGuardGuard } from '../Global/auth-guard/auth-guard.guard'
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {UploadPhotoDto} from './dto/upload-photo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as multer from 'multer';
import { PhotoPaginationDto } from './dto/photo-pagination.dto';

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

  // @UseGuards(AuthGuardGuard) // ✅ Apply Guard
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

@Post('refresh-token')
async refreshToken(@Body() refreshtokendto: RefreshTokenDto ) {
  return this.usersService.refreshToken(refreshtokendto);
}

// @UseGuards(AuthGuardGuard)
@Post('/upload-photo')
  @UseInterceptors(FileInterceptor('photo',{ storage: multer.memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload user profile photo',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        photo: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadPhotoDto: UploadPhotoDto,
  ) {
    return this.usersService.uploadUserPhoto(uploadPhotoDto.userId, file);
  }

  @Post('/photos')
async getUserPhotos(@Body() paginationDto: PhotoPaginationDto) {
  return this.usersService.getUserPhotos(paginationDto);
}

}
