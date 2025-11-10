import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RequestMiddleware } from './Global/middlewares/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLogModule } from './error-log/error-log.module';
import { ProposalsModule } from './proposals/proposals.module';
import { AuthanticationModule } from './authantication/authantication.module';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsModule } from './notifications/notifications.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TodosController } from './todos/todos.controller';
import { TodosService } from './todos/todos.service';
import { TodosModule } from './todos/todos.module';
import { CronController } from './cron/cron.controller';
import { CronService } from './cron/cron.service';
import { CronModule } from './cron/cron.module';
import { CommonModule } from './Global/services/common.module';
import { ThrottlerModule,ThrottlerGuard  } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [UsersModule,ConfigModule.forRoot({ isGlobal: true },), ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, 
    }),
    ThrottlerModule.forRoot({
  throttlers: [
    {
      name: 'otp',
      limit: 20,
      ttl: 10000,
    },
  ],
})
    ,ErrorLogModule, ProposalsModule, AuthanticationModule, NotificationsModule, FirebaseModule, TodosModule, CronModule,CommonModule],
  controllers: [AppController, NotificationsController, TodosController, CronController],
  providers: [AppService, NotificationsService, TodosService, CronService, 
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes('users/login');
  }
}
