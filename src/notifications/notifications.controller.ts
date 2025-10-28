import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendPush(dto);
  }
}
