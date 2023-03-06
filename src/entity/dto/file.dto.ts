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