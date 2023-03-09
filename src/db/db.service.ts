import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import path, { join } from 'path';
import { User } from 'src/entity/user.entity';
import { Stream } from 'stream';
import { Connection, DataSource, getManager, Repository } from 'typeorm';
import * as moment from 'moment'
import { FileDto } from 'src/entity/dto/file.dto';
import * as fs from "fs";
import { File } from 'src/entity/file.entity';
import { createHash } from 'crypto'
import { buffer2Stream } from 'src/utils/commonUtils';
import { Exception } from 'sass';
import sizeOf from "image-size"
import { Image } from 'src/entity/image.entity';
import * as gm from 'gm'
import { ImageDto, ImageFromOtherOption, SaveImageOption } from 'src/entity/dto/image.dto';
import { ROLE } from 'src/entity/role.entity';
import { getImageFromOther } from 'src/utils/imageUtils';

/**
 * 物理文件描述
 */
class physicalFileDto {
    dayDir: string; //  抽象时间路径
    originalName: string;
    contentType: string;

    uniqueFileName: string;
    thumbFileName: string;

    path: string;   //  数据库存储的路径
    thumbPath: string;
    phyiscalPath: string;   //  完整的物理路径
    physicalThumbPath: string;

    dir: string;    //  文件存储目录
    thumbDir: string;

    private BASIC_DIR = join(process.cwd(), "resource")
    private imageType = [
        "jpg", "jpeg", "png", "svg", "webp", "gif", "raw", "dmg", "bmp", "psd"
    ]

    private supportThumbType = [
        "jpg", "jpeg", "png", "webp"
    ]

    constructor(file: FileDto) {
        this.contentType = file.contentType;
        this.originalName = file.fileName;
        this.dayDir = moment().format('yyyy/MM/DD')

        this.uniqueFileName = `${file.fileName}_${this.randomStr()}.${file.contentType}`
        this.path = join("upload", this.dayDir, this.uniqueFileName)
        this.phyiscalPath = join(this.BASIC_DIR, this.path)
        this.dir = join(this.BASIC_DIR, "upload", this.dayDir)

        if (this.supportThumb()) {
            this.thumbFileName = `thumb_${this.uniqueFileName}`
            this.thumbPath = join("thumb", this.dayDir, this.thumbFileName)
            this.physicalThumbPath = join(this.BASIC_DIR, this.thumbPath)
            this.thumbDir = join(this.BASIC_DIR, "thumb", this.dayDir)
        }
    }

    isImage() {
        return this.imageType.indexOf(this.contentType) != -1
    }

    supportThumb() {
        return this.supportThumbType.indexOf(this.contentType) != -1
    }

    private randomStr(num: number = 8): string {
        return Math.random().toString(36).slice(-num)
    }
}

@Injectable()
export class DbService {
    private BASIC_DIR = join(process.cwd(), "resource")
    private logger = new Logger("DbService")

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(File) private fileRepository: Repository<File>,
        @InjectRepository(Image) private imageRepository: Repository<Image>,
        private readonly datasource: DataSource
    ) {
        if (!fs.existsSync(this.BASIC_DIR)) {
            fs.mkdirSync(this.BASIC_DIR, { recursive: true })
        }
    }

    //  ---------- User ----------
    async findUser(username: string) {
        return this.userRepository.findOneBy({
            username
        })
    }

    async existUser(username: string) {
        return (await this.userRepository.count({
            where: {
                username
            }
        })) != 0
    }

    async addUser(username: string, password: string, role: ROLE) {
        return this.userRepository.save({
            username,
            password,
            role
        })
    }


    async changePassword(username: string, password: string) {
        const res = await this.datasource.transaction(async (manager) => {
            const user = await manager.findOneBy(User, {
                username: username
            })
            if (!user) throw new BadRequestException("未找到用户！")
            const res = await manager.update(User, user.id, { ...user, password })
            if (res) return "更新成功！"
            return "更新失败！"
        })

        return res

    }

    //  ---------- File ----------

    /**
     * 存储文件
     * @param file 文件
     * @param path 存储路径
     */
    async save(file: FileDto, path: string, uniqueFileName: string): Promise<boolean> {
        try {
            return new Promise((resolve, reject) => {
                const target = join(path, uniqueFileName)
                //  生成路径
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
                }
                //  打开文件写入流
                const stream = fs.createWriteStream(target)
                //  写入文件
                if (file.buffer) {
                    stream.write(file.buffer)
                } else if (file.stream) {
                    stream.write(file.stream)
                } else {
                    throw new BadRequestException("文件流不存在！")
                }
                //  关闭写入流
                stream.end()
                stream.on('finish', async () => {
                    resolve(true)
                })
                stream.on("error", () => {
                    this.logger.error("文件存储失败！")
                    if (fs.existsSync(target)) {
                        this.rmdir(target, () => { })
                    }
                    reject(false)
                })
            })
        } catch (e: any) {
            this.logger.error("文件存储失败！")
            throw new BadRequestException("文件存储错误！")
        }
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
    async saveImage(
        image: FileDto,
        option: SaveImageOption
    ): Promise<ImageDto> {
        try {
            const physicalImageInfo = new physicalFileDto(image)
            const imageSizeInfo = sizeOf(image.buffer)
            const tmp = []
            //  存储图片
            const saveImage = async () => {
                //  存储图片
                const success = await this.save(image, physicalImageInfo.dir, physicalImageInfo.uniqueFileName)
                let md5 = null
                if (option.md5 == true) {
                    md5 = await this.getFileMd5(image.buffer)
                }
                if (success) {
                    const res = await this.fileRepository.save({
                        fileName: image.fileName,
                        contentType: image.contentType,
                        filePath: physicalImageInfo.path,
                        md5: md5
                    })
                    return res
                }
                return null
            }

            const saveThumbImage = async () => {
                const thumbImage = await this.generateThumImage(image)
                const success = await this.save(thumbImage, physicalImageInfo.thumbDir, physicalImageInfo.thumbFileName)
                let md5 = null
                if (option.md5 == true) {
                    md5 = await this.getFileMd5(thumbImage.buffer)
                }
                if (success) {
                    const res = await this.fileRepository.save({
                        fileName: thumbImage.fileName,
                        contentType: thumbImage.contentType,
                        filePath: physicalImageInfo.thumbPath,
                        md5: md5
                    })
                    return res
                }
                return null
            }

            tmp.push(saveImage())
            if (option.thumb && physicalImageInfo.supportThumb()) {
                tmp.push(saveThumbImage())
            }
            const res = await Promise.all<File>(tmp)
            const file_1 = res[0]
            let file_2 = null
            if (res.length >= 2) file_2 = res[1]
            if (file_1 != null) {
                const res = await this.imageRepository.save({
                    file: file_1,
                    width: imageSizeInfo.width,
                    height: imageSizeInfo.height,
                    thumbFile: file_2,
                    thirdParty: option.thirdParty ? option.thirdParty : false,
                    thirdPartyType: option.thirdPartyType
                })

                return this.Image2ImageDto(res)

            } else {
                return null
            }

        } catch (e: any) {
            this.logger.error("图片存储失败！")
            throw new BadRequestException("图片存储失败！")
        }
    }

    /**
     * 获取文件流
     * @param path 文件存储路径
     * @returns 
     */
    async getImageStream(path: string) {
        const file = await this.fileRepository.findOneBy({ filePath: path })

        if (!file) throw new BadRequestException("文件不存在！")
        return fs.createReadStream(join(this.BASIC_DIR, path))

    }

    /**
     * 分页查询
     */
    async getImages(option: PageQueryDto): Promise<ImageDto[]> {
        option.pageIndex = option.pageIndex ? option.pageIndex : 0
        option.pageSize = option.pageSize ? option.pageSize : 20
        option.reverse = option.reverse ? option.reverse : false
        option.sortBy = option.sortBy ? option.sortBy : "createTime"
        option.thirdParty = option.thirdParty ? option.thirdParty : false
        option.thirdPartyType = option.thirdPartyType ? option.thirdPartyType : "all"

        let orderType: "ASC" | "DESC" = "DESC"
        if (option.reverse) orderType = "ASC"
        const query = this.imageRepository.createQueryBuilder("image")

        if (option.thirdParty) {
            query.where("image.thirdParty = :v1", {v1: true})
            if (option.thirdPartyType != "all") query.where("image.thirdPartyType = :v2", {v2: option.thirdPartyType})
        } else {
            query.where("image.thirdParty = :v1", {v1: false})
            query.orWhere("image.thirdParty is NULL")
        }

        const res = await query.orderBy("image.createTime", orderType)
        .skip(option.pageSize * option.pageIndex)
        .take(option.pageSize)
        .leftJoinAndSelect("image.file", "file")
        .leftJoinAndSelect("image.thumbFile", "thumbFile")
        .getMany()

        return res.map(item => this.Image2ImageDto(item))
        // const res = await this.imageRepository.find({
        //     order: {
        //         createTime: orderType
        //     },
        //     skip: option.pageSize * option.pageIndex,
        //     take: option.pageSize,
        //     relations: ["file", "thumbFile"]
        // })
        // return res.map(item => this.Image2ImageDto(item))
    }

    /**
     * 
     * @returns 图片总数
     */
    async getImageCount() {
        return this.imageRepository.count()
    }

    /**
     * 拉取第三方图库的图片
     */
    async fetchImagesFromOther(param: ImageFromOtherOption): Promise<ImageDto[]> {
        if (!param.num) param.num = 20
        if (!param.type) param.type = "top"
        const fileDtos = await getImageFromOther(param.num, param.type)
        const res = []
        for (const fileDto of fileDtos) {
            const imageDto = await this.saveImage(fileDto, {
                md5: true,
                thumb: true,
                thirdParty: true,
                thirdPartyType: param.type
            })
            res.push(imageDto)
        }
        return res
    }


    async getRandomThirdPartyImage(num: number, type?: string): Promise<ImageDto[]> {
        const query = this.imageRepository.createQueryBuilder("image")
            .where("image.thirdParty = :value", { value: true })
        if (type) query.where("image.thirdPartyType = :value", { value: type })
        const images = await query.leftJoinAndSelect("image.file", "file")
            .leftJoinAndSelect("image.thumbFile", "thumbFile")
            .orderBy("RANDOM()")
            .limit(num)
            .getMany()
        
        const res: ImageDto[] = []
        for(const image of images) {
            res.push(this.Image2ImageDto(image))
        }
        return res
        
    }


    private async generateThumImage(image: FileDto): Promise<FileDto> {
        const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
            gm(image.buffer).resize(160, null).toBuffer((err, buffer) => {
                if (err) {
                    throw new BadRequestException("缩略图压缩出错！")
                }
                resolve(buffer)
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

    private rmdir(dir: string, cb: fs.NoParamCallback) {
        fs.readdir(dir, function (err, files) {
            next(0);
            function next(index) {
                if (index == files.length)
                    return fs.rmdir(dir, cb);
                let newPath = path.join(dir, files[index]);
                console.log(newPath)
                fs.stat(newPath, function (err, stat) {
                    if (err) {
                        console.log(err);
                    }
                    if (stat.isDirectory()) {
                        this.rmdir(newPath, () => next(index + 1));
                    } else {
                        fs.unlink(newPath, function (err) {
                            if (err) {
                                console.error(err);
                            }
                            next(index + 1);
                        });
                    }
                })
            }
        })
    }

    private pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
        });
        return result;
    }

    private Image2ImageDto(image: Image): ImageDto {
        const fileDto: FileDto = {
            fileName: image.file.fileName,
            contentType: image.file.contentType,
            filePath: image.file.filePath,
            md5: image.file.md5
        }
        let thumb = null
        if (image.thumbFile) {
            thumb = image.thumbFile.filePath
        }

        return {
            file: fileDto,
            thumbPath: thumb,
            width: image.width,
            height: image.height,
            thirdParty: image.thirdParty,
            thirdPartyType: image.thirdPartyType,
            createTime: image.createTime
        }
    }

}
