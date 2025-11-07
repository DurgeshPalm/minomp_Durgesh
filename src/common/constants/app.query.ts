
import { Injectable } from "@nestjs/common/decorators/core";
import { TableUsersEntity, TableConnectionsEntity,TableDevicesEntity,TableProposalsEntity,TableProposalMappingEntity, TableCustomRewardsEntity, TableRewardsEntity,TableCountryCodesEntity } from "../../common/constants/app.columns";
import { Tables } from "../../common/constants/app.tables";

@Injectable()
export class QueryService {
 parentExistQuery = `SELECT ${TableConnectionsEntity.parentId} FROM ${Tables.Table_Connections} WHERE ${TableConnectionsEntity.kidId} = ? AND status = 1`
 addProposal =  `INSERT INTO ${Tables.Table_Proposals} (${TableProposalsEntity.proposalName}, ${TableProposalsEntity.userId}, ${TableProposalsEntity.rewardId}, ${TableProposalsEntity.minompTime}, ${TableProposalsEntity.breakTime}, ${TableProposalsEntity.status},${TableProposalsEntity.startDatetime},${TableProposalsEntity.endDatetime},${TableProposalsEntity.reward_type})  VALUES (?, ?, ?, ?, ?, ?,?,?,?)`
 ProposalMapping = `INSERT INTO ${Tables.Table_ProposalMapping} (${TableProposalMappingEntity.kidId}, ${TableProposalMappingEntity.parentId}, ${TableProposalMappingEntity.proposalId}, ${TableProposalMappingEntity.status}, ${TableProposalMappingEntity.requestDatetime}) VALUES (?, ?, ?, ?, NOW())`
 addCustomReward = `INSERT INTO ${Tables.Table_CustomRewards} (${TableCustomRewardsEntity.rewardName}, ${TableCustomRewardsEntity.rewardIcon}, ${TableCustomRewardsEntity.userId}) values (?, ?, ?)`
 fetchRewardList = `SELECT ${TableRewardsEntity.rewardName}, ${TableRewardsEntity.rewardIcon} FROM ${Tables.Table_Rewards}  UNION all SELECT ${TableCustomRewardsEntity.rewardName}, ${TableCustomRewardsEntity.rewardIcon} AS reward_icon  FROM ${Tables.Table_CustomRewards} WHERE ${TableCustomRewardsEntity.userId} = ?`
 checkCountryCodeQuery = `SELECT country_code FROM ${Tables.Table_CountryCodes} WHERE ${TableCountryCodesEntity.id} = ? and ${TableCountryCodesEntity.isActive} = 1`;
 checkUserMobilenoQuery = `SELECT id,role,password FROM ${Tables.Table_Users} WHERE ${TableUsersEntity.mobileNo} = ? and ${TableUsersEntity.isDeleted} = 0 `;
 checkUserEmailQuery = `SELECT id,role,password FROM ${Tables.Table_Users} WHERE ${TableUsersEntity.email} = ? and ${TableUsersEntity.isDeleted} = 0`;
 UserDeviceInfoQuery = `  INSERT INTO ${Tables.Table_Devices} (    ${TableDevicesEntity.userId},    ${TableDevicesEntity.deviceModel},    ${TableDevicesEntity.deviceType},${TableDevicesEntity.appVersion},${TableDevicesEntity.osVersion}  ) VALUES (?, ?, ?, ?, ?)`;
 proposalCheckQuery = `SELECT minomp_time, break_time FROM proposals WHERE id = ? AND user_id = ? AND status = 'ongoing' AND is_deleted = 0`;
 lastSessionQuery = `SELECT end_time FROM time_tracking  WHERE proposal_id = ? ORDER BY end_time DESC LIMIT 1`;
 insertTimeTrackQuery = `INSERT INTO time_tracking (proposal_id, start_time, end_time, break_time_used, spent_time, used_breaktime, create_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) `;
 totalSpentQuery = `SELECT SUM(spent_time) AS total_spent FROM time_tracking WHERE proposal_id = ? `;
 updateProposalQuery = `UPDATE proposals SET status = 'completed', end_datetime = NOW() WHERE id = ?`;
}
export const getLastInsertId = `SELECT LAST_INSERT_ID() as id;`;
