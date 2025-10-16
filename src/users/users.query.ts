
import { Injectable } from "@nestjs/common/decorators/core";
import { TableUsersEntity,TableCountryCodesEntity, TableConnectionsEntity,TableDevicesEntity } from "../common/constants/app.columns";
import { Tables } from "../common/constants/app.tables";

@Injectable()
export class QueryService {
 
  addNewUserQuery = `INSERT INTO ${Tables.Table_Users} (${TableUsersEntity.username},${TableUsersEntity.email},${TableUsersEntity.password},${TableUsersEntity.role},${TableUsersEntity.countryCodeId},${TableUsersEntity.mobileNo},${TableUsersEntity.token})VALUES(?,?,?,?,?,?,?)`;
  checkCountryCodeQuery = `SELECT 1 FROM ${Tables.Table_CountryCodes} WHERE ${TableCountryCodesEntity.id} = ? and ${TableCountryCodesEntity.isActive} = 1`;
  checkUserMobilenoQuery = `SELECT id,role,password FROM ${Tables.Table_Users} WHERE ${TableUsersEntity.mobileNo} = ? and ${TableUsersEntity.isDeleted} = 0 `;
  checkUserEmailQuery = `SELECT id,role,password FROM ${Tables.Table_Users} WHERE ${TableUsersEntity.email} = ? and ${TableUsersEntity.isDeleted} = 0`;
  parentkidmapping = `  INSERT INTO ${Tables.Table_Connections} (${TableConnectionsEntity.parentId}, ${TableConnectionsEntity.kidId})   VALUES (?, ?)`;
  getUserIdByEmailOrMobileQuery = `SELECT id FROM users WHERE email = ? OR mobileno = ?`;
  GetAllCountryCodeQuery = `SELECT ${TableCountryCodesEntity.id},${TableCountryCodesEntity.countryName},${TableCountryCodesEntity.countryCode} FROM ${Tables.Table_CountryCodes} WHERE ${TableCountryCodesEntity.isActive} = 1`;
  deleteUserQuery = `UPDATE ${Tables.Table_Users} SET ${TableUsersEntity.isDeleted} = 1 WHERE ${TableUsersEntity.id} = ?`;
  getUserByIdQuery = `SELECT ${TableUsersEntity.id},${TableUsersEntity.username},${TableUsersEntity.email},${TableUsersEntity.role},${TableUsersEntity.countryCodeId},${TableUsersEntity.mobileNo},${TableUsersEntity.token} FROM ${Tables.Table_Users} WHERE ${TableUsersEntity.id} = ? and ${TableUsersEntity.isDeleted} = 0`;
  UserDeviceInfoQuery = `  INSERT INTO ${Tables.Table_Devices} (    ${TableDevicesEntity.userId},    ${TableDevicesEntity.deviceModel},    ${TableDevicesEntity.deviceType},${TableDevicesEntity.appVersion},${TableDevicesEntity.osVersion}  ) VALUES (?, ?, ?, ?, ?)`;
}
export const getLastInsertId = `SELECT LAST_INSERT_ID() as id;`;
