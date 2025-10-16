import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLogModule } from './error-log/error-log.module';
import { ProposalsModule } from './proposals/proposals.module';
import { AuthanticationModule } from './authantication/authantication.module';

@Module({
  imports: [UsersModule,ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // host: process.env.DB_HOST || 'localhost',
      // port: Number(process.env.DB_PORT) || 3306,
      // username: process.env.DB_USER || 'root',
      // password: process.env.DB_PASS || 'Palm@123',
      // database: process.env.DB_NAME || 'testdb',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, 
    }),ErrorLogModule, ProposalsModule, AuthanticationModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
