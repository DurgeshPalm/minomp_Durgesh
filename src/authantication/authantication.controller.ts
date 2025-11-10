import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthanticationService } from './authantication.service';
import { SendOtpDto,VerifyOtpDto} from './dto/create-authantication.dto';
import { ForgotPasscodeDto } from './dto/forgot-passcode.dto';
import { Throttle,ThrottlerGuard } from '@nestjs/throttler';
import { ResetPasswordDto } from './dto/reset-password.dto';



@Controller('authantication')
export class AuthanticationController {
  constructor(private readonly authanticationService: AuthanticationService) {}

  @UseGuards(ThrottlerGuard)
  @Post('send_otp')
  @Throttle({
  otp: { limit: 2, ttl: 10000 }
})
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

  @Post('reset_password')
async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  return this.authanticationService.resetPassword(resetPasswordDto);
}

}
