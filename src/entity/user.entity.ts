import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ROLE } from "./role.entity"

@Entity()
export class User {
   @PrimaryGeneratedColumn()
   id: number

   @Column()
   username: string

   @Column()
   password: string

   @Column({ nullable: true })
   role: ROLE

   @CreateDateColumn()
   createTime : string
   @UpdateDateColumn() 
   updateTime : string
}