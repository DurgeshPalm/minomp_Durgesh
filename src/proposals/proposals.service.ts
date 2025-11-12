import { Injectable } from "@nestjs/common/decorators/core";
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { QueryService } from "../common/constants/app.query";
import { LogMessage, LogMessageType,RespDesc,RespStatusCodes } from '../common/constants/app.messages';
import { ProposalListDto } from "./dto/proposalList.dto";
import { EditProposalDto } from "./dto/edit-proposal.dto";
import { DeleteProposalDto } from "./dto/delete-proposal.dto";
import { AcceptRejectProposalDto } from "./dto/accept-reject.dto";
import { RewardReceivedStatusDto } from "./dto/reward-received.dto";
import { ProposalDetailDto } from "./dto/proposal-detail.dto";
import { TimeTrackerDto } from "./dto/time-track.dto";



@Injectable()
export class ProposalsService {
  constructor(private readonly dataSource: DataSource,private readonly queryService: QueryService) {}
  async create(createProposalDto: CreateProposalDto): Promise<any> {
    const { proposal_name, reward_id, reward_name, start_datetime, end_datetime, status, userid } = createProposalDto;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let reward_type: string | null;
      const currentDateTime = new Date();

if (new Date(start_datetime) < currentDateTime) {
    return { resp_code: RespStatusCodes.Failed, message: LogMessage.startDatetimeCannotBePast };
}

if (new Date(end_datetime) <= new Date(start_datetime)) {
    return { resp_code: RespStatusCodes.Failed, message: LogMessage.invalidDateRange };
}
        const [connection] = await queryRunner.query(this.queryService.parentExistQuery, [userid]);
        if (!connection || !connection.parent_id) {
            return { resp_code: RespStatusCodes.Failed, message: LogMessage.parentNotFound };
        }

        const parent_id = connection.parent_id;
        let finalRewardId = reward_id;
        reward_type='admin';


        if (!reward_id && reward_name) {
            const customRewardResult = await queryRunner.query(this.queryService.addCustomReward, 
                [reward_name, 'default_icon.png', userid]
            );
            finalRewardId = customRewardResult.insertId;
            reward_type = 'custom';
        }

        const startTime = new Date(start_datetime).getTime();
        const endTime = new Date(end_datetime).getTime();
        
        if (endTime <= startTime) {
            return { resp_code: RespStatusCodes.Failed, message: LogMessage.invalidDateRange };
        }

        const minomp_time = Math.floor((endTime - startTime) / 1000); 
        const break_time = Math.floor(minomp_time * 0.3); 

  const existingProposal = await queryRunner.query(
  `SELECT id FROM proposals WHERE user_id = ? AND is_deleted = 0 
  AND ((start_datetime BETWEEN ? AND ?) OR (end_datetime BETWEEN ? AND ?))`,
  [userid, start_datetime, end_datetime, start_datetime, end_datetime]
);

if (existingProposal.length > 0) {
  return { resp_code: RespStatusCodes.Failed, message: LogMessage.proposalAlreadyExists };
}

        
        const proposalResult = await queryRunner.query(this.queryService.addProposal, 
            [proposal_name, userid, finalRewardId, minomp_time, break_time, status || 'pending', start_datetime, end_datetime,reward_type]
        );

        const proposal_id = proposalResult.insertId;

        await queryRunner.query(this.queryService.ProposalMapping, 
            [userid, parent_id, proposal_id, 'pending']
        );

        await queryRunner.commitTransaction();
        return {
            resp_code: RespStatusCodes.Success,
            resp_message: LogMessage.Proposal_created_successfully,
            userid,
            proposal_id,
            proposal_name,
            parent_id,
            reward_id: finalRewardId,
            minomp_time,
            break_time
        };

    } catch (error) {
        await queryRunner.rollbackTransaction();
        return {
            resp_code: RespStatusCodes.Failed,
            resp_message: LogMessage.Failed_to_create_proposal,
            error: error.message
        };
    } finally {
        await queryRunner.release();
    }
}

  async getRewards(userid: number): Promise<any> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const rewards = await queryRunner.query(this.queryService.fetchRewardList, [userid]);

        await queryRunner.commitTransaction();
        return {
            resp_code: RespStatusCodes.Success,
            resp_message: LogMessage.Rewards_fetched_successfully,
            rewards,
        };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        return {
            resp_code: RespStatusCodes.Failed,
            resp_message: LogMessage.Something_went_wrong,
        };
    } finally {
        await queryRunner.release();
    }
}

async getProposalList(proposalListDto: ProposalListDto): Promise<any> {
  const { userid, role, proposal_status, page, rows } = proposalListDto;
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const offset = (page - 1) * rows;
    let query = '';
    let params: any[] = [];

    if (role === 'C') {
      // ✅ Child: proposals created by the child (existing logic)
      query = `
        SELECT 
            p.id AS proposal_id,
            p.proposal_name,
            IF(p.reward_type = 'custom', cr.reward_name, r.reward_name) AS reward_name,
            IF(p.reward_type = 'custom', cr.reward_icon, r.reward_icon) AS reward_icon,
            p.is_received_reward AS reward_received_status,
            p.status AS proposal_status,
            p.start_datetime,
            p.end_datetime,
            u.username AS createdby
        FROM proposals p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN rewards r ON p.reward_id = r.id AND p.reward_type = 'admin'
        LEFT JOIN custome_rewards cr ON p.reward_id = cr.id AND p.reward_type = 'custom'
        WHERE p.user_id = ?
        AND p.is_deleted = 0
      `;
      params = [userid];

      if (proposal_status) {
        query += ' AND p.status = ?';
        params.push(proposal_status);
      }

      query += ' ORDER BY p.created_date DESC LIMIT ? OFFSET ?';
      params.push(rows, offset);
    } 
    
    else if (role === 'P') {
      // ✅ Parent: proposals sent to this parent (via proposal_mapping)
      query = `
        SELECT 
            p.id AS proposal_id,
            p.proposal_name,
            IF(p.reward_type = 'custom', cr.reward_name, r.reward_name) AS reward_name,
            IF(p.reward_type = 'custom', cr.reward_icon, r.reward_icon) AS reward_icon,
            p.is_received_reward AS reward_received_status,
            p.status AS proposal_status,
            p.start_datetime,
            p.end_datetime,
            u.username AS createdby,
            pm.status AS mapping_status
        FROM proposals p
        INNER JOIN proposal_mapping pm ON pm.proposal_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN rewards r ON p.reward_id = r.id AND p.reward_type = 'admin'
        LEFT JOIN custome_rewards cr ON p.reward_id = cr.id AND p.reward_type = 'custom'
        WHERE pm.parent_id = ?
        AND p.is_deleted = 0
        ORDER BY p.created_date DESC
        LIMIT ? OFFSET ?
      `;
      params = [userid, rows, offset];
    }

    const proposals = await queryRunner.query(query, params);

    return {
      resp_code: RespStatusCodes.Success,
      resp_message: RespDesc.Success,
      data: proposals,
    };
  } catch (error) {
    return {
      resp_code: RespStatusCodes.Failed,
      resp_message: RespDesc.Failed,
      error: error.message,
    };
  } finally {
    await queryRunner.release();
  }
}


async editProposal(editProposalDto: EditProposalDto): Promise<any> {
  const { proposal_id, userid, proposal_name, start_datetime, end_datetime } = editProposalDto;
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
      // 1️⃣ Validate that the proposal exists, is pending, and is not deleted
      const [existingProposal] = await queryRunner.query(`
          SELECT 1 FROM proposals 
          WHERE id = ? AND user_id = ? AND status = 'pending' AND is_deleted = 0
      `, [proposal_id, userid]);

      if (!existingProposal) {
          return {
              resp_code: RespStatusCodes.Failed,
              resp_message: "Proposal not found or cannot be edited"
          };
      }

      const now = new Date();
      const startTime = new Date(start_datetime ?? '');
      const endTime = new Date(end_datetime ?? '');

      if (startTime < now) {
          return {
              resp_code: RespStatusCodes.Failed,
              resp_message: LogMessage.startDatetimeCannotBePast
          };
      }

      if (endTime <= startTime) {
          return {
              resp_code: RespStatusCodes.Failed,
              resp_message: LogMessage.invalidDateRange
          };
      }

      const [conflictingProposal] = await queryRunner.query(`
          SELECT id FROM proposals WHERE user_id = ? AND is_deleted = 0 AND ((start_datetime BETWEEN ? AND ?) OR (end_datetime BETWEEN ? AND ?))`
      , [userid, proposal_id, start_datetime, end_datetime, start_datetime, end_datetime]);

      if (conflictingProposal) {
          return {
              resp_code: RespStatusCodes.Failed,
              resp_message: LogMessage.proposalAlreadyExists,
          };
      }

      // 4️⃣ Update the proposal
      await queryRunner.query(`
          UPDATE proposals 
          SET proposal_name = ?, start_datetime = ?, end_datetime = ?, updated_date = NOW()
          WHERE id = ?
      `, [proposal_name, start_datetime, end_datetime, proposal_id]);

      await queryRunner.commitTransaction();
      return {
          resp_code: RespStatusCodes.Success,
          resp_message: RespDesc.Success,
      };

  } catch (error) {
      await queryRunner.rollbackTransaction();
      return {
          resp_code: RespStatusCodes.Failed,
          resp_message: RespDesc.Failed,
          error: error.message
      };
  } finally {
      await queryRunner.release();
  }
}

async deleteProposal(deleteProposalDto: DeleteProposalDto): Promise<any> {
  const { userid, proposal_id } = deleteProposalDto;

  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
      const [existingProposal] = await queryRunner.query(
          `SELECT 1 FROM proposals WHERE id = ? AND user_id = ? AND is_deleted = 0 AND status = 'pending'`,
          [proposal_id, userid]
      );

      if (!existingProposal) {
          return { resp_code: RespStatusCodes.Failed, resp_message: "Proposal not found or cannot be deleted" };
      }

      await queryRunner.query(
          `UPDATE proposals SET is_deleted = 1 WHERE id = ?`,
          [proposal_id]
      );

      await queryRunner.commitTransaction();
      return { resp_code: RespStatusCodes.Success, resp_message: RespDesc.Success };
      
  } catch (error) {
      await queryRunner.rollbackTransaction();
      return { resp_code: RespStatusCodes.Failed, resp_message: "Failed to delete proposal", error: error.message };
  } finally {
      await queryRunner.release();
  }
}

async acceptRejectProposal(acceptRejectProposalDto: AcceptRejectProposalDto): Promise<any> {
  const { userid, proposal_id, proposal_status } = acceptRejectProposalDto;
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
      
      const [proposal] = await queryRunner.query(
          `SELECT p.user_id FROM proposals p 
           JOIN proposal_mapping pm ON p.id = pm.proposal_id 
           WHERE pm.parent_id = ? AND p.id = ? AND p.is_deleted = 0`,
          [userid, proposal_id]
      );

      if (!proposal) {
          return { resp_code: RespStatusCodes.Failed, resp_message: 'Proposal not found or already deleted' };
      }

      await queryRunner.query(
          `UPDATE proposals SET status = ? WHERE id = ?`,
          [proposal_status, proposal_id]
      );

      await queryRunner.query(
          `UPDATE proposal_mapping SET status = ? WHERE proposal_id = ? AND parent_id = ?`,
          [proposal_status, proposal_id, userid]
      );

      await queryRunner.commitTransaction();
      return {
          resp_code: RespStatusCodes.Success,
          resp_message: `Proposal ${proposal_status} successfully`,
          proposal_sender_id: proposal.user_id,
          proposal_id,
          proposal_status,
      };
  } catch (error) {
      await queryRunner.rollbackTransaction();
      return { resp_code: 500, resp_message: 'Failed to update proposal', error: error.message };
  } finally {
      await queryRunner.release();
  }
}

async updateRewardReceivedStatus(rewardReceivedStatusDto: RewardReceivedStatusDto): Promise<any> {
  const { userid, proposal_id, reward_received_status } = rewardReceivedStatusDto;
  const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
      const [proposal] = await queryRunner.query(
          `SELECT id FROM proposals 
           WHERE id = ? AND user_id = ? AND status = 'completed' AND is_deleted = 0`,
          [proposal_id, userid]
      );

      if (!proposal) {
          return { resp_code: RespStatusCodes.Failed, resp_message: 'Proposal not found or not eligible for reward update' };
      }

      await queryRunner.query(
          `UPDATE proposals SET is_received_reward = ? WHERE id = ?`,
          [reward_received_status, proposal_id]
      );

      await queryRunner.commitTransaction();
      return {
          resp_code: RespStatusCodes.Success,
          resp_message: RespDesc.Success,
          proposal_id,
          reward_received_status
      };
  } catch (error) {
      await queryRunner.rollbackTransaction();
      return { resp_code: RespStatusCodes.Failed, resp_message: RespDesc.Failed, error: error.message };
  } finally {
      await queryRunner.release();
  }
}

async getProposalDetail(proposalDetailDto: ProposalDetailDto): Promise<any> {
    const { proposal_id, status } = proposalDetailDto;
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const query = `
        SELECT 
          p.proposal_name,
          CASE 
            WHEN p.reward_type = 'custom' THEN cr.reward_name 
            ELSE r.reward_name 
          END AS reward_name,
          CASE 
            WHEN p.reward_type = 'custom' THEN cr.reward_icon 
            ELSE r.reward_icon 
          END AS reward_icon,
          p.is_received_reward AS reward_received_status,
          p.status AS proposal_status,
          p.start_datetime,
          p.end_datetime,
          u.username AS createdby
        FROM proposals p
        LEFT JOIN rewards r ON p.reward_id = r.id AND p.reward_type = 'admin'
        LEFT JOIN custome_rewards cr ON p.reward_id = cr.id AND p.reward_type = 'custom'
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ? AND p.status = ? AND p.is_deleted = 0
      `;

      const result = await queryRunner.query(query, [proposal_id, status]);

      if (result.length === 0) {
        return { resp_code: 404, resp_message: 'Proposal not found' };
      }

      return {
        resp_code: 200,
        resp_message: 'Proposal details fetched successfully',
        data: result[0],
      };
    } catch (error) {
      return { resp_code: 500, resp_message: 'Failed to fetch proposal details', error: error.message };
    } finally {
      await queryRunner.release();
    }
  }

  async trackTime(timeTrackerDto: TimeTrackerDto): Promise<any> {
    const { proposal_id, userid, start_datetime, end_datetime } = timeTrackerDto;
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      
      const proposal = await queryRunner.query(this.queryService.proposalCheckQuery, [proposal_id, userid]);
  
      if (proposal.length === 0) {
        return { resp_code: RespStatusCodes.Failed, resp_message: 'Proposal not found or not in ongoing status' };
      }
  
      const { minomp_time, break_time } = proposal[0];
  
      const startTime = new Date(start_datetime).getTime();
      const endTime = new Date(end_datetime).getTime();
      const spent_time = Math.floor((endTime - startTime) / 1000);
  
      if (spent_time <= 0) {
        return { resp_code: RespStatusCodes.Failed, resp_message: 'Invalid time duration' };
      }
  
      const lastSession = await queryRunner.query(this.queryService.lastSessionQuery, [proposal_id]);
  
      let used_breaktime = 0;
      if (lastSession.length > 0) {
        const lastEndTime = new Date(lastSession[0].end_time).getTime();
        used_breaktime = Math.floor((startTime - lastEndTime) / 1000);
      }

      if (lastSession.length === 0) {
        used_breaktime = 0;
      }
  
      if (used_breaktime > break_time) {
        return { resp_code: RespStatusCodes.Failed, resp_message: 'Break time exceeded allowed limit' };
      }

      await queryRunner.query(this.queryService.insertTimeTrackQuery, [proposal_id, start_datetime, end_datetime, break_time, spent_time, used_breaktime]);

      
      const totalSpentResult = await queryRunner.query(this.queryService.totalSpentQuery, [proposal_id]);
      let total_spent_time = totalSpentResult[0].total_spent || 0;

      let remaining_time_to_spend = minomp_time - total_spent_time;
      if (remaining_time_to_spend < 0) remaining_time_to_spend = 0;
  
      if (remaining_time_to_spend === 0) {
        await queryRunner.query(this.queryService.updateProposalQuery, [proposal_id]);
  
      }
  
      await queryRunner.commitTransaction();
  
      return {
        resp_code: RespStatusCodes.Success,
        resp_message: 'Time tracking updated successfully',
        remaining_time_to_spend,
        break_time,
        userid,
        proposal_id,
        proposal_status: remaining_time_to_spend === 0 ? 'completed' : 'ongoing',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { resp_code: RespStatusCodes.Failed, resp_message: 'Failed to track time', error: error.message };
    } finally {
      await queryRunner.release();
    }
  }
  
}
