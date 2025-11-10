import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { QueryService } from "../common/constants/app.query";
import { LogMessage, RespStatusCodes } from '../common/constants/app.messages';
import { SendOtpDto, VerifyOtpDto } from './dto/create-authantication.dto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasscodeDto } from './dto/forgot-passcode.dto';
import { MailService } from '../Global/services/mail.service';
import { SmsService } from '../Global/services/sms.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthanticationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly queryService: QueryService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  // ✅ Send OTP
  async sendOtp({ email, mobileno, country_code_id }: SendOtpDto) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiryTime = new Date(Date.now() + 1 * 60 * 1000);
    let countryCode = '';
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let user_id = null;
      let otp_type: string | null = null;

      if (mobileno) {
        const mobileNumberCheck = await queryRunner.query(
          this.queryService.checkUserMobilenoQuery,
          [mobileno],
        );
        if (mobileNumberCheck.length === 0) {
          return {
            resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_email_or_mobile_number,
          };
        }

        user_id = mobileNumberCheck[0].id;
        otp_type = 'mobile';

        if (!country_code_id) {
          return {
            resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_country_code,
          };
        }

        const countryCodeCheck = await queryRunner.query(
          this.queryService.checkCountryCodeQuery,
          [country_code_id],
        );

        if (countryCodeCheck.length === 0) {
          return {
            resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_country_code,
          };
        }

        countryCode = countryCodeCheck[0].country_code;
      }

      if (email) {
        const EmailCheck = await queryRunner.query(
          this.queryService.checkUserEmailQuery,
          [email],
        );

        if (EmailCheck.length === 0) {
          return {
            resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_email_or_mobile_number,
          };
        }

        user_id = EmailCheck[0].id;
        otp_type = 'email';
      }

      if (!email && !mobileno) {
        return {
          resp_code: RespStatusCodes.Failed,
          message: LogMessage.email_or_mobileno_required,
        };
      }

      // ✅ Insert OTP record
      await queryRunner.query(
        `INSERT INTO otp (code, userid, expiredatetime, create_datetime, is_used, count, is_expired, otpType)
         VALUES (?, ?, ?, NOW(), 0, 0, 0, ?)`,
        [otp, user_id, expiryTime, otp_type],
      );

      // ✅ Send email
      if (email) {
        const subject = 'Your MINOMP OTP Code';
        const html = `<p>Your OTP code is: <strong>${otp}</strong></p>`;
        await this.mailService.sendMail(email, subject, `Your OTP code is: ${otp}`, html);
      }

      // ✅ Send SMS
      if (mobileno) {
        const fullMobile = `${countryCode}${mobileno}`;
        const smsMsg = `Your MINOMP OTP is: ${otp}`;
        await this.smsService.sendSms(fullMobile, smsMsg);
      }

      await queryRunner.commitTransaction();

      return {
        resp_code: RespStatusCodes.Success,
        resp_message: LogMessage.otp_sent_successfully,
        userid: user_id,
        otp, // ⚠️ include only for testing — remove in production
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("OTP Error:", error);
      return {
        resp_code: RespStatusCodes.Failed,
        resp_message: LogMessage.failed_to_send_otp,
      };
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ Verify OTP & Update Password (used for both forgot password and login OTP)
async verifyOtp({ userid, otp, new_password }: VerifyOtpDto & { new_password?: string }) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const [otpRecord] = await queryRunner.query(
      `SELECT * FROM otp WHERE userid = ? AND code = ? AND is_used = 0 AND is_expired = 0
       AND expiredatetime > NOW()`,
      [userid, otp]
    );

    if (!otpRecord) {
      return { resp_code: RespStatusCodes.Failed, resp_message: LogMessage.INVALID_OTP };
    }

    await queryRunner.query(`UPDATE otp SET is_used = 1 WHERE id = ?`, [otpRecord.id]);

    return {
      resp_code: RespStatusCodes.Success,
      resp_message: new_password
        ? LogMessage.password_updated_successfully
        : LogMessage.otp_verified_successfully,
    };
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return {
      resp_code: RespStatusCodes.Failed,
      resp_message: LogMessage.Something_went_wrong,
    };
  } finally {
    await queryRunner.release(); // ✅ Always release connection
  }
}


  // ✅ Forgot Password — now internally sends OTP
  async forgotPasscode(dto: ForgotPasscodeDto) {
    const { email, mobileno, country_code_id } = dto;

    // Step 1️⃣: Send OTP internally
    const otpResponse = await this.sendOtp({ email, mobileno, country_code_id });

    if (otpResponse.resp_code !== RespStatusCodes.Success) {
      return otpResponse;
    }

    // Step 2️⃣: Return user ID and OTP (for testing)
    return {
      resp_code: RespStatusCodes.Success,
      resp_message: LogMessage.otp_sent_successfully,
      userid: otpResponse.userid, 
      otp: otpResponse.otp, // ⚠️ remove in production
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
  const { userid, new_password } = resetPasswordDto;
  const hashedPassword = await bcrypt.hash(new_password, 10);
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const [user] = await queryRunner.query(`SELECT id FROM users WHERE id = ?`, [userid]);

    if (!user) {
      return {
        resp_code: RespStatusCodes.Failed,
        resp_message: LogMessage.USER_NOT_FOUND,
      };
    }

    await queryRunner.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userid]);

    return {
      resp_code: RespStatusCodes.Success,
      resp_message: LogMessage.password_updated_successfully,
    };
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return {
      resp_code: RespStatusCodes.Failed,
      resp_message: LogMessage.Something_went_wrong,
    };
  } finally {
    await queryRunner.release();
  }
}

}
