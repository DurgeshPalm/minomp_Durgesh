import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail', // Or use SMTP/Outlook/other services
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // 👈 Add this line to bypass SSL errors
      }
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Neuball Team" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }
}
