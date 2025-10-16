import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthanticationService } from './authantication.service';
import { SendOtpDto,VerifyOtpDto} from './dto/create-authantication.dto';
import { ForgotPasscodeDto } from './dto/forgot-passcode.dto';



@Controller('authantication')
export class AuthanticationController {
  constructor(private readonly authanticationService: AuthanticationService) {}

  @Post('send_otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
      return this.authanticationService.sendOtp(sendOtpDto);
  }

  @Post('verify_otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
      return this.authanticationService.verifyOtp(verifyOtpDto);
  }

  @Post('forgot_passcode')
  async forgotPasscode(@Body() forgotPasscodeDto: ForgotPasscodeDto) {
      return this.authanticationService.forgotPasscode(forgotPasscodeDto);
  }
}
