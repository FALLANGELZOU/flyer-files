import { ReadStream } from "fs"

export interface FileDto {

    fileName: string //  文件名称
 
    contentType: string  //  文件类型
 
    md5?: string  //  文件MD5
    
    filePath?: string //  文件路径

    buffer?: Buffer

    stream?: ReadStream

    originalFileName?: string

 }


 export const file2FileDto = (file: Express.Multer.File): FileDto => {
    const tmp = file.originalname.split(".")
    return {
        fileName: tmp.slice(0,tmp.length-1).join(""),
        contentType: tmp.pop() as string,
        buffer: file.buffer,
        originalFileName: file.originalname
    }
 }