import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MailService } from '../Global/services/mail.service';
import { CronMailDto } from './dto/cron-mail.dto';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  private jobName = 'mail-cron';
  private config: CronMailDto | null = null;
  private cronExpression = '*/2 * * * *'; // every 2 minutes

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    // If you want to auto-start with default config read from env or DB,
    // call this.startCron(). By default, do nothing until config is set by API.
    this.logger.debug('CronService initialized');
  }

  setConfig(dto: CronMailDto) {
    this.config = dto;
    this.logger.log(`Cron mail config updated: recipients=${dto.recipients.length}`);
    if (dto.enabled) {
      this.startCron();
    } else {
      this.stopCronIfExists();
    }
  }

  getConfig() {
    return this.config;
  }

  async sendNow(): Promise<void> {
    if (!this.config) {
      this.logger.warn('sendNow called but no cron config set');
      throw new Error('Cron mail configuration not set');
    }

    // send to all recipients (could be looped or sent in bulk)
    const { recipients, subject, text, html } = this.config;

    // Option A: send single mail with comma-separated recipients
    // await this.mailService.sendMail(recipients.join(','), subject, text, html);

    // Option B: send individually (safer when tracking fails per-recipient)
    for (const to of recipients) {
      try {
        await this.mailService.sendMail(to, subject, text, html);
        this.logger.log(`Email sent to ${to} (manual trigger).`);
      } catch (err: any) {
        this.logger.error(`Failed to send mail to ${to}: ${err?.message || err}`);
      }
    }
  }

  startCron() {
    // if job exists and running, do nothing
    try {
      const existing = this.schedulerRegistry.getCronJob(this.jobName);
      if (existing) {
        this.logger.log('Cron job already exists — starting it.');
        existing.start();
        return;
      }
    } catch (e) {
        console.log("Cron Error:",e);
        
    }

    const job = new CronJob(this.cronExpression, async () => {
      try {
        if (!this.config) {
          this.logger.warn('Cron triggered but config not present — skipping.');
          return;
        }

        this.logger.log('Cron triggered: sending scheduled emails.');
        const { recipients, subject, text, html } = this.config;
        for (const to of recipients) {
          try {
            await this.mailService.sendMail(to, subject, text, html);
            this.logger.log(`Email sent to ${to}`);
          } catch (err: any) {
            this.logger.error(`Error sending mail to ${to} in cron: ${err?.message || err}`);
          }
        }
      } catch (err) {
        this.logger.error('Unhandled error inside cron job: ' + err?.message || err);
      }
    });

    this.schedulerRegistry.addCronJob(this.jobName, job);
    job.start();
    this.logger.log(`Cron job '${this.jobName}' started with expression ${this.cronExpression}`);
  }

  stopCronIfExists() {
    try {
      const job = this.schedulerRegistry.getCronJob(this.jobName);
      job.stop();
      this.schedulerRegistry.deleteCronJob(this.jobName);
      this.logger.log(`Cron job '${this.jobName}' stopped and removed.`);
    } catch (err) {
      // no job existed
      this.logger.debug('No cron job to stop.');
    }
  }

  enableOrDisable(enabled: boolean) {
    if (enabled) {
      this.startCron();
    } else {
      this.stopCronIfExists();
    }
  }
}
