import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
    
  @Column()
  @Field(type => String)
  code: string;

  @OneToOne(type => User, {onDelete: "CASCADE"})
  @JoinColumn()
  user: User;

  @BeforeUpdate()
  @BeforeInsert()
  createCode(): void {
    this.code = Math.random().toString().slice(2,8);
  }
}