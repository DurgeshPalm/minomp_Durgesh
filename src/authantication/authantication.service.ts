import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { QueryService } from "../common/constants/app.query";
import { LogMessage, LogMessageType, RespStatusCodes } from '../common/constants/app.messages';
import { SendOtpDto,VerifyOtpDto } from './dto/create-authantication.dto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasscodeDto } from './dto/forgot-passcode.dto';
import { MailService } from '../Global/services/mail.service'; 
import { SmsService } from '../Global/services/sms.service';


@Injectable()
export class AuthanticationService {
  constructor(private readonly dataSource: DataSource,private readonly queryService: QueryService,private readonly mailService: MailService,private readonly smsService: SmsService){}
  async sendOtp({ email, mobileno, country_code_id }: SendOtpDto) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryTime = new Date(Date.now() + 1 * 60 * 1000); 
  let countryCode =  '';
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let user_id = null;
    let otp_type: string | null = null;

    // ✅ MOBILE OTP LOGIC
    if (mobileno) {
      const mobileNumberCheck = await queryRunner.query(
        this.queryService.checkUserMobilenoQuery,
        [mobileno]
      );
      if (mobileNumberCheck.length === 0) {
        return { resp_code: RespStatusCodes.Failed, message: LogMessage.valid_email_or_mobile_number };
      }

      user_id = mobileNumberCheck[0].id;
      otp_type = 'mobile';

      if (!country_code_id) {
        return { resp_code: RespStatusCodes.Failed, message: LogMessage.valid_country_code };
      }

      const countryCodeCheck = await queryRunner.query(
        this.queryService.checkCountryCodeQuery,
        [country_code_id]
      );


      if (countryCodeCheck.length === 0) {
        return { resp_code: RespStatusCodes.Failed, message: LogMessage.valid_country_code };
      }
     countryCode = countryCodeCheck[0].country_code;
    }

    // ✅ EMAIL OTP LOGIC
    if (email) {
      const EmailCheck = await queryRunner.query(
        this.queryService.checkUserEmailQuery,
        [email]
      );

      if (EmailCheck.length === 0) {
        return { resp_code: RespStatusCodes.Failed, message: LogMessage.valid_email_or_mobile_number };
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

    // ✅ INSERT OTP IN DB
    await queryRunner.query(
      `INSERT INTO otp (code, userid, expiredatetime, create_datetime, is_used, count, is_expired, otpType)
       VALUES (?, ?, ?, NOW(), 0, 0, 0, ?)`,
      [otp, user_id, expiryTime, otp_type]
    );

    // ✅ SEND EMAIL
    if (email) {
      const subject = 'Your MINOMP OTP Code';
      const text = `Your OTP code is: ${otp}`;
      const html = `<p>Your OTP code is: <strong>${otp}</strong></p>`;

      await this.mailService.sendMail(email, subject, text, html);
    }

    // ✅ SEND MOBILE SMS
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
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    return {
      resp_code: RespStatusCodes.Failed,
      resp_message: LogMessage.failed_to_send_otp,
    };
  } finally {
    await queryRunner.release();
  }
}

async verifyOtp({ userid, otp }: VerifyOtpDto) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const [otpRecord] = await queryRunner.query(
        `SELECT * FROM otp WHERE userid = ? AND code = ? AND is_used = 0 AND is_expired = 0
         AND expiredatetime > NOW()`,
        [userid, otp]
    );

    if (!otpRecord) {
        return { resp_code: RespStatusCodes.Failed, resp_message: 'Invalid or expired OTP' };
    }

    await queryRunner.query(`UPDATE otp SET is_used = 1 WHERE id = ?`, [otpRecord.id]);
    return { resp_code: RespStatusCodes.Success, resp_message: 'OTP verified successfully' };
}

async forgotPasscode(ForgotPasscodeDto: ForgotPasscodeDto) {
  const { email, mobileno, country_code_id, new_password } = ForgotPasscodeDto;
  const hashedPassword = await bcrypt.hash(new_password, 10);
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let user = null;
    const deviceInfo = {
      deviceModel: '16 Pro',
      deviceType: 'ios',
      appVersion: '1.0.0',
      osVersion: '16',
    };

    if (mobileno) {
      if (!country_code_id) {
        return {
          resp_code: RespStatusCodes.Failed,
          message: LogMessage.valid_country_code,
        };
      }

      const countryCodeCheck = await queryRunner.query(
        this.queryService.checkCountryCodeQuery,
        [country_code_id]
      );

      if (countryCodeCheck.length === 0) {
        return {
          resp_code: RespStatusCodes.Failed,
          message: LogMessage.valid_country_code,
        };
      }

      const mobileNumberCheck = await queryRunner.query(
        this.queryService.checkUserMobilenoQuery,
        [mobileno]
      );

      if (mobileNumberCheck.length > 0) {
        user = mobileNumberCheck[0].id;
      }
    }

    if (email) {
      const emailCheck = await queryRunner.query(
        this.queryService.checkUserEmailQuery,
        [email]
      );

      if (emailCheck.length > 0) {
        user = emailCheck[0].id; 
      }
    }

    if (!user) {
      return {
        resp_code: RespStatusCodes.Failed,
        resp_message: LogMessage.USER_NOT_FOUND,
      };
    }

    await queryRunner.query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, user]
    );

    await queryRunner.query(
      this.queryService.UserDeviceInfoQuery,
      [user, deviceInfo.deviceModel, deviceInfo.deviceType, deviceInfo.appVersion, deviceInfo.osVersion]
    );

    await queryRunner.commitTransaction();

    return {
      resp_code: RespStatusCodes.Success,
      resp_message: LogMessage.password_updated_successfully,
    };
  } catch (error) {
    console.error(LogMessage.Something_went_wrong, error);
    await queryRunner.rollbackTransaction();
    return {
      resp_code: RespStatusCodes.Failed,
      resp_message: LogMessage.Something_went_wrong,
    };
  } finally {
    await queryRunner.release();
  }
}

   }