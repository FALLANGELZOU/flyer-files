import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { File } from "./file.entity"

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(tpye => File)
    @JoinColumn()
    file: File  //  原图对应的文件

    @OneToOne(type => File)
    @JoinColumn()
    thumbFile: File  //  缩略图对应的文件

    @Column()
    width: number;  //  原图宽

    @Column()
    height: number; //  原图高

    @Column({ nullable: true} )
    thirdParty: boolean;    //  是否是第三方图片

    @Column({ nullable: true })
    thirdPartyType: "pc" | "top" | "random" | "mp"; //  第三方图片类型
    
    @CreateDateColumn()
    createTime: Date  //  文件创建时间

    @UpdateDateColumn()
    updateTime: Date  //  文件变更时间
}