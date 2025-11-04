import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Injectable } from "@nestjs/common/decorators/core";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { QueryService } from './users.query';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../common/constants/app.constant';
import { LogMessage, LogMessageType,RespStatusCodes } from '../common/constants/app.messages';
import { FindParentChildDto } from './dto/findParentChild.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly queryService: QueryService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, password, mobileno, country_code_id, role, connectionid } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const validCountryCodeId = country_code_id == null ? null : Number(country_code_id);
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deviceInfo = {
        deviceModel: '16 Pro',
        deviceType: 'android',   
        appVersion: '1.0.0',    
        osVersion: '16' 
      };
      if(mobileno){
        const mobileNumberCheck = await queryRunner.query(
          this.queryService.checkUserMobilenoQuery,[mobileno]);
            if (mobileNumberCheck.length > 0) {
              return { resp_code: RespStatusCodes.Failed,
                message: LogMessage.mobile_number_already_exists };
            }
      if(!validCountryCodeId){
          return { 
            resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_country_code };
      }
      const countryCodeCheck = await queryRunner.query(
      this.queryService.checkCountryCodeQuery,[validCountryCodeId]);
        if (countryCodeCheck.length === 0) {
          return { 
            resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_country_code };
        }
      }
      if(email){
        const EmailChek = await queryRunner.query(
        this.queryService.checkUserEmailQuery,[email]);
        if (EmailChek.length > 0) {
          return { resp_code: RespStatusCodes.Failed,
            message: LogMessage.email_already_exists };
        }
      }
      if (!email && !mobileno) {
        return { resp_code: RespStatusCodes.Failed,
          message: LogMessage.email_or_mobileno_required };
      }
      
      const result = await queryRunner.query(
        this.queryService.addNewUserQuery,
        [name, email || null, hashedPassword,role,validCountryCodeId,mobileno || null, null] 
      );
      const userId = result.insertId;
      await queryRunner.query(
        this.queryService.UserDeviceInfoQuery,
        [userId, deviceInfo.deviceModel, deviceInfo.deviceType, deviceInfo.appVersion, deviceInfo.osVersion]
      );   
      if (connectionid) {
        if (role === 'C') {
          await queryRunner.query(this.queryService.parentkidmapping, [connectionid, userId]);
        } else {
          await queryRunner.query(this.queryService.parentkidmapping, [userId, connectionid]);
        }
      }
      // Generate JWT and refresh token after user creation
      const token = jwt.sign({ id: userId, email, mobileno, role }, SECRET_KEY, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: userId, email, mobileno, role }, SECRET_KEY, { expiresIn: '7d' });
      // Update user record with tokens
      await queryRunner.query(
        `UPDATE users SET token = ?, refresh_token = ? WHERE id = ?`,
        [token, refreshToken, userId]
      );
      await queryRunner.commitTransaction();
      return { 
        resp_code: RespStatusCodes.Success,
        message: LogMessage.USER_CREATED_SUCCESSFULLY, token, refreshToken, userId, role };
    } catch (error) {
      console.error(LogMessage.Something_went_wrong, error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async login(email: string | null, password: string,mobileNo: string | null,country_code_id: Number | null | string): Promise<any> {
    const validCountryCodeId = !country_code_id || country_code_id === '' ? null : Number(country_code_id);
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const deviceInfo = {
        deviceModel: '16 Pro',
        deviceType: 'ios',   
        appVersion: '1.0.0',    
        osVersion: '16' 
      };
      if(mobileNo){
        if(!validCountryCodeId){
          return { 
            resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_country_code };
      }
      const countryCodeCheck = await queryRunner.query(
      this.queryService.checkCountryCodeQuery,[validCountryCodeId]);
        if (countryCodeCheck.length === 0) {
          return { resp_code: RespStatusCodes.Failed,
            message: LogMessage.valid_country_code };
        }
        const mobileNumberCheck = await queryRunner.query(
          this.queryService.checkUserMobilenoQuery,[mobileNo]);
            if (mobileNumberCheck.length > 0) {
              const user = mobileNumberCheck[0]; 
              if (!user || !await bcrypt.compare(password, user.password)) {
                  return { resp_code: RespStatusCodes.Failed,
                    message: LogMessage.INVALID_CREDENTIALS };
              }
              await queryRunner.query(
                this.queryService.UserDeviceInfoQuery,
                [user.id, deviceInfo.deviceModel, deviceInfo.deviceType, deviceInfo.appVersion, deviceInfo.osVersion]
              );   
              return { resp_code: RespStatusCodes.Success,
                data: mobileNumberCheck };
            }
      }
      if(email){
        const EmailChek = await queryRunner.query(
        this.queryService.checkUserEmailQuery,[email]);
        if (EmailChek.length > 0) {
          const user = EmailChek[0]; 
        if (!user || !await bcrypt.compare(password, user.password)) {
        return { resp_code: RespStatusCodes.Failed,
          message: LogMessage.INVALID_CREDENTIALS };
    }
    await queryRunner.query(
      this.queryService.UserDeviceInfoQuery,
      [user.id, deviceInfo.deviceModel, deviceInfo.deviceType, deviceInfo.appVersion, deviceInfo.osVersion]
    );    
          return { resp_code: RespStatusCodes.Success,
            data : EmailChek };
        }
        else {
          return { resp_code: RespStatusCodes.Failed,
            message: LogMessage.USER_NOT_FOUND };
        }
      }
      if (!email && !mobileNo) {
        return { resp_code: RespStatusCodes.Failed,
          message: LogMessage.email_or_mobileno_required };
      }
 } catch (error) {
    console.error(LogMessage.Something_went_wrong, error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
}

async getCountryCode()
{
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  try
  {
    const get_country_code = await queryRunner.query(
      this.queryService.GetAllCountryCodeQuery);
      return { data: get_country_code };
  } catch (error) {
    console.error(LogMessage.Something_went_wrong, error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }

}

async deleteUser(id: number): Promise<any> {
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const user = await queryRunner.query(
      this.queryService.getUserByIdQuery,
      [id]
    );
    if (!user || user.length === 0) {
      return { resp_code: RespStatusCodes.Failed,
        message: LogMessage.USER_NOT_FOUND };
    }
    const result = await queryRunner.query(
      this.queryService.deleteUserQuery,
      [id]
    );
    if (result.affected === 0) {
      return { resp_code: RespStatusCodes.Failed,
        message: LogMessage.USER_NOT_DELETED };
    }
    await queryRunner.commitTransaction();
    return { 
      resp_code: RespStatusCodes.Success,
      message: LogMessage.USER_DELETED_SUCCESSFULLY };
  } catch (error) {
    console.error(LogMessage.Something_went_wrong, error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
}

async findParentChild(findDto: FindParentChildDto) {
  const { name, email, mobileno, role } = findDto;
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
  let query = `SELECT id, username, email, mobileno, role FROM users WHERE is_deleted = 0`;
  const params: any[] = [];

  if (email) {
    query += ` AND email = ?`;
    params.push(email);
  } else if (mobileno) {
    query += ` AND mobileno = ?`;
    params.push(mobileno);
  } else if (name) {
    query += ` AND username = ?`;
    params.push(name);
  } else {
    return { resp_code: RespStatusCodes.Failed,
      message: LogMessage.email_or_mobileno_required };
  }
  
    query += ` AND role = ?`;
    params.push(role);
  
  const result = await this.dataSource.query(query, params);
  await queryRunner.commitTransaction();
  return {
    resp_code: result.length ? RespStatusCodes.Success : RespStatusCodes.Failed,
    resp_message: result.length ? 'Data found' : 'No data found',
    data: result.map(user => ({
      id: user.id,
      username: user.username,
      contact: user.email || user.mobileno,
      role: user.role,
    })),
  };
}


catch (error) {
  console.error(LogMessage.Something_went_wrong, error);
  await queryRunner.rollbackTransaction();
} finally {
  await queryRunner.release();
}

}
}
