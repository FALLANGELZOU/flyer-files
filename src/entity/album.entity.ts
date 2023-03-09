import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Image } from "./image.entity";

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    desc: string;

    @ManyToMany(() => Image, image => image.albums)
    images: Image[]

    @CreateDateColumn({ select: false })
    createTime: Date 

    @UpdateDateColumn({ select: false })
    updateTime: Date 
}