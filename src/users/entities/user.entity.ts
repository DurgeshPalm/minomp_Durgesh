import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;


  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  mobileno: string;

  @ApiProperty()
  @Column()
  country_code_id: number;

  @ApiProperty()
  @Column()
  role: string;

  @ApiProperty()
  @Column()
  connectionid: number;
}