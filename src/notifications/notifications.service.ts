import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as admin from 'firebase-admin';
import { RespDesc, RespStatusCodes } from '../common/constants/app.messages';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async sendPush(dto: SendNotificationDto) {
    const message: admin.messaging.Message = {
      token: dto.token,
      notification: {
        title: dto.title,
        body: dto.body,
      },
      android: {
        priority: 'high',
        notification: { sound: 'default' },
      },
      apns: {
        payload: { aps: { sound: 'default' } },
      },
    };

    try {
      const response = await this.firebaseService.getMessaging().send(message);
      this.logger.log(`Notification sent successfully: ${response}`);
      return { resp_code: RespStatusCodes.Success ,resp_message: RespDesc.Success,data:[{title:dto.title,message:dto.body}]};
    } catch (error) {
      this.logger.error('Error sending push', error);
      return { resp_code: RespStatusCodes.Failed, resp_message: RespDesc.Failed ,Errormsg:error};
    }
  }
}
