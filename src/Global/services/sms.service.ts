import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.ACCOUNT_SID_TWILIO,
      process.env.AUTH_TOKEN_TWILIO
    );
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });

      console.log(`SMS sent successfully to ${to}`);
    } catch (error) {
      console.error(`Error sending SMS: ${error.message}`);
      throw error;
    }
  }
}
