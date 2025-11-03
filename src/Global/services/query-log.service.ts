import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Tables } from '../../common/constants/app.tables';
import { TableLogsEntity } from '../../common/constants/app.columns';
import { LogMessageType } from '../../common/constants/app.messages';

@Injectable()
export class QueryLogService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Logs any query-level exception or info to the database.
   * Automatically called by QueryService when a query fails.
   *
   * @param query - SQL query that caused error
   * @param parameters - Query parameters (if any)
   * @param error - Error object or message
   * @param userId - Optional user identifier
   */
  async logQueryError(
    query: string,
    parameters: any[] = [],
    error: any,
    userId: number | null = null,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `INSERT INTO ${Tables.Table_Logs} (
            ${TableLogsEntity.requestPath},
            ${TableLogsEntity.requestMethod},
            ${TableLogsEntity.requestData},
            ${TableLogsEntity.logMessage},
            ${TableLogsEntity.logMessageType},
            ${TableLogsEntity.responseData},
            ${TableLogsEntity.requestDatetime},
            ${TableLogsEntity.responseDatetime},
            ${TableLogsEntity.userId}
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
        [
          'QueryService', 
          'DB_QUERY', 
          JSON.stringify({ query, parameters }),
          error?.message || 'Unknown query error',
          LogMessageType.ERROR,
          JSON.stringify({ stack: error?.stack || null }),
          userId,
        ],
      );
    } catch (logError) {
      console.error('❌ Failed to log query error:', logError);
    }
  }
}
