import { Injectable } from '@nestjs/common';
import { CreateErrorLogDto } from './dto/create-error-log.dto';
import { UpdateErrorLogDto } from './dto/update-error-log.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TableLogsEntity } from "../common/constants/app.columns";
import { Tables } from "../common/constants/app.tables";
import { LogMessageType } from '../common/constants/app.messages';

@Injectable()
export class ErrorLogService {

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async logApiCall(
    apiUrl: string, 
    requestMethod: string, 
    requestObject: any, 
    response: any, 
    isError: boolean, 
    userId: number | null = null
): Promise<void> {
    const logMessageType = isError ? LogMessageType.ERROR : LogMessageType.INFO;

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
                apiUrl,
                requestMethod,
                JSON.stringify(requestObject),
                isError ? 'Error occurred' : 'Success',
                logMessageType,
                JSON.stringify({ response, isError }),
                userId
            ]
        );
    } catch (error) {
        console.error('Error logging API call:', error);
    }
}


}

