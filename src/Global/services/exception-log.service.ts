import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Tables } from '../../common/constants/app.tables';
import { TableLogsEntity } from '../../common/constants/app.columns';
import { LogMessageType } from '../../common/constants/app.messages';

@Injectable()
export class ExceptionLogService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Logs API exceptions to the database.
   * Automatically called by the global HttpExceptionFilter.
   *
   * @param requestUrl - API endpoint where exception occurred
   * @param method - HTTP method (GET, POST, etc.)
   * @param exception - Error object or message
   * @param requestBody - Original request payload
   * @param userId - Optional user identifier
   */
  async logException(
    requestUrl: string,
    method: string,
    exception: any,
    requestBody: any,
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
            ${TableLogsEntity.responseDatetime}
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());`,
        [
          requestUrl,
          method,
          JSON.stringify(requestBody || {}),
          exception?.message || 'Unhandled exception',
          LogMessageType.ERROR,
          JSON.stringify({
            message: exception?.message || null,
            stack: exception?.stack || null,
          }),
        ],
      );
    } catch (logError) {
      console.error('❌ Failed to log exception:', logError);
    }
  }
}
