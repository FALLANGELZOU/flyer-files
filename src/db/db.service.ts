import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import path, { join } from 'path';
import { User } from 'src/entity/user.entity';
import { Stream } from 'stream';
import { Repository } from 'typeorm';
import * as moment from 'moment'
import { FileDto } from 'src/entity/dto/file.dto';
import * as fs from "fs";
import { File } from 'src/entity/file.entity';
import { createHash } from 'crypto'
import { buffer2Stream } from 'src/utils/commonUtil';
import { Exception } from 'sass';
import sizeOf from "image-size"
import { Image } from 'src/entity/image.entity';
import * as gm from 'gm'

@Injectable()
export class DbService {
    private BASIC_DIR = join(process.cwd(), "resource/upload")
    private THUMB_DIR  = join(process.cwd(), "resource/thum")
    private logger = new Logger("DbService")

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(File) private fileRepository: Repository<File>,
        @InjectRepository(Image) private imageRepository: Repository<Image>
    ) {
        if (!fs.existsSync(this.BASIC_DIR)) {
            fs.mkdirSync(this.BASIC_DIR, { recursive: true })
        }
        if (!fs.existsSync(this.THUMB_DIR)) {
            fs.mkdirSync(this.THUMB_DIR, { recursive: true })
        }
    }

    //  ---------- User ----------
    async findUser(username: string, password: string) {
        return this.userRepository.findOneBy({
            username,
            password
        })
    }

    async addUser(username: string, password: string) {
        return this.userRepository.save({
            username,
            password
        })
    }

    //  ---------- File ----------

    /**
     * 存储文件
     * @param file 文件信息
     * @param isThumb 是否是存储的缩略图
     * @returns 数据库写入文件信息
     */
    async saveFile(file: FileDto, isThumb: boolean = false): Promise<File> {
        if (file.buffer) { 
            let dir = this.BASIC_DIR
            let prefix = ""
            if (isThumb) {
                dir = this.THUMB_DIR
                prefix = "thumb_"
            }

            return new Promise((resolve, reject) => {
                const day = moment().format('yyyy/MM/DD')
                const filePath = join(day, `${prefix}${file.fileName}_${this.randomStr()}.${file.contentType}`)
                const targetPath = join(dir, filePath)

                if (!fs.existsSync(join(dir, day))) {
                    fs.mkdirSync(join(dir, day), { recursive: true });
                }

                try {
                    //  写入文件
                    this.logger.log("文件存储中...")
                    const stream = fs.createWriteStream(targetPath)
                    stream.write(file.buffer)
                    stream.end()
                    stream.on('finish', async () => {
                        this.logger.log("生成文件MD5中...")
                        const md5 = await this.getFileMd5(file.buffer)
                        this.logger.log("文件信息写入中...")
                        const res = await this.fileRepository.save({
                            fileName: file.fileName,
                            contentType: file.contentType,
                            filePath: filePath,
                            md5: md5
                        })

                        this.logger.log("文件存储成功！")
                        resolve(res)
                    })
                    stream.on("error", () => {
                        this.logger.error("文件存储失败！尝试删除错误文件...")
                        fs.rm(targetPath, () => {
                            this.logger.log("错误文件已删除！")
                        })
                        reject()
                    })
                } catch (e: any) {
                    this.logger.error("文件存储失败！尝试删除错误文件...")
                    fs.rm(targetPath, () => {
                        this.logger.log("错误文件已删除！")
                    })
                }

            })
        }

        throw new BadRequestException("文件上传错误！")
    }


    /**
     * 获取文件
     * @param path 文件路径
     * @returns 文件信息
     */
    async getFile(path: string): Promise<FileDto> {
        const file = await this.fileRepository.findOneBy({
            filePath: path
        })

        if (!file) throw new BadRequestException("文件不存在！")
        const stream = fs.createReadStream(join(this.BASIC_DIR, path))
        return {
            fileName: file.fileName,
            contentType: file.contentType,
            md5: file.md5,
            stream: stream
        }
    }

    //  ---------- image ----------
    async saveImage(image: FileDto) {
        if (image.buffer) {
            const imageInfo = sizeOf(image.buffer)
            const file = await this.saveFile(image)
            let thumbFile: File = null
            if (this.supportThumImage(imageInfo.type)) {
                const thumImageDto = await this.generateThumImage(image)
                thumbFile = await this.saveFile(thumImageDto, true)
            }
            return this.imageRepository.save({
                file: file,
                width: imageInfo.width,
                height: imageInfo.height,
                thumbFile: thumbFile
            })
        }
    }

    private async supportThumImage(type?: string) {
        if (type == "jpeg" || type == "jpg" || type == "png") return true
        return false
    }

    private async generateThumImage(image: FileDto): Promise<FileDto> {
        const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
            gm(image.buffer).resize(160, null).toBuffer((err, buffer) => {
            resolve(buffer)
            if (err) reject(err)
        })
    })
        return {
            ...image,
            buffer: fileBuffer
        }
    }

    private randomStr(num: number = 8): string {
        return Math.random().toString(36).slice(-num)
    }


    private getFileMd5 = (buffer: Buffer): Promise<string> => {
        return new Promise((resolve, reject) => {
            const hash = createHash('md5'); // 创建一个Hash对象
            const stream = buffer2Stream(buffer)
            stream.on('data', (data) => {
                hash.update(data); // 向Hash对象中添加数据
            });
            stream.on('end', () => {
                const md5 = hash.digest('hex'); // 获取Hash值
                resolve(md5);
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });
    }


}
