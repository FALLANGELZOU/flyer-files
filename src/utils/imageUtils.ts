import { HttpService } from "@nestjs/axios";
import axios, { AxiosResponse } from "axios";
import { map } from "rxjs";
const https = require("https");
import { Logger } from "@nestjs/common";
import { randomStr } from "./commonUtils";
import { FileDto } from "src/entity/dto/file.dto";

const logger = new Logger("ImageUtls")
export const getImageFromOther = async (num: number = 20, type: "pc" | "mp" | "top" | "random" = "top"): Promise<FileDto[]> => {
    try {
        const promise = new Promise<FileDto[]>(async (resolve, reject) => {
            const res = await axios.get(`https://iw233.cn/api.php?sort=${type}&type=json&num=${num}`)
            const images: FileDto[] = []
            if (res.status == 200) {
                res.data?.pic?.forEach(async (url: string) => {
                    https.get(url, (res: any) => {
                        if (res.statusCode == 200) {
                            const chunks = []
                            res.on('data', (chunk) => {
                                chunks.push(chunk)
                            })
                            res.on('end', () => {
                                const contentType = url.split(".").pop()
                                const fileName = randomStr(24)
                                const buffer = Buffer.concat(chunks)
                                images.push({
                                    fileName,
                                    contentType,
                                    buffer
                                })
                                if (images.length == num) {
                                    resolve(images)
                                }
                            })
                        } else {
                            
                            logger.error("下载第三方图片错误！")
                            reject([]);
                        }
                    })
                });
            } else {
                reject([]);
            }
        })   

        return promise
    } catch (e: any) {
        logger.error("访问第三方图库出错！");
        return []
    }
}