import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class User {
   @PrimaryGeneratedColumn()
   id: number

   @Column()
   username: string

   @Column()
   password: string

   @Column()
   role: string

   @CreateDateColumn()
   createTime : String

   @UpdateDateColumn()
   updateTime : String
}