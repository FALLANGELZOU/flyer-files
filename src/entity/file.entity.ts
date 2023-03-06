import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class File {
   @PrimaryGeneratedColumn()
   id: number

   @Column()
   fileName: string //  文件名称

   @Column()
   contentType: string  //  文件类型

   @Column({ nullable: true })
   md5: string  //  文件MD5
   
   @Column()
   filePath: string //  文件路径

   @CreateDateColumn()
   createTime : String  //  文件创建时间

   @UpdateDateColumn()
   updateTime : String  //  文件变更时间
}